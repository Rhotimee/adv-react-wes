const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail')
const { hasPermission } = require('../utils')
const stripe =  require('../stripe');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that')
    }

    const item = await ctx.db.mutation.createItem({
      data: {
        // This is how we create a relationship between
        // the Item and user. 
        user: {
          connect: {
            id: ctx.request.userId
          }
        },
        ...args
      }
    }, info);

    return item;
  },

  updateItem(parent, args, ctx, info) {
    // first take a copy of the data
    const updates = { ...args }
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info)
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{
      id
      title
      user { id }
    }`)
    // 2. check if they own that item or have the permission
    if (!ctx.request.userId) {
      throw new Error("You don't have permission to delete");
    }

    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.some(
      permission => ['ADMIN','ITEMDELETE'].includes(permission)
    );

    if (!ownsItem && !hasPermission) {
      throw new Error("You don't have permission to do that! "); 
    }
    // 3. Delete the item
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    // create the user in the database
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER']},
      },
    }, info
    );
    // create JWT token
    const token = jwt.sign({
      userId: user.id
    }, process.env.APP_SECRET)
    //  we set a jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // return user to the browser
    return user
  },
  async signin(parent, { email, password }, ctx, info) {
    // 1. Check if there is a user with the email
    const user  = await ctx.db.query.user({
      where: {email}
    })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // 2. check if the password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid Password');
    }
    // 3. generate the JWT token
    const token = jwt.sign({
      userId: user.id
    }, process.env.APP_SECRET)
    // 4. we set a jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // 5. return user
    return user
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye' }
  },
  async requestReset(parent, args, ctx, info) {
    // 1.  Check if this is a real user
    const user  = await ctx.db.query.user({
      where: {email: args.email}
    })
    if (!user) {
      throw new Error(`No such user found for email ${email}`)
    }
    // 2. set a reset token and expiry on that user
    const randomBytesPromisified = promisify(randomBytes)
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry  = Date.now() + 3600000; // 1 hour from now. 

    const res  = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })
    // 3. Email them that reset token
    const mailRes  = await transport.sendMail({
      from: 'noreply@timi.com',
      to: user.email,
      subject: 'Your Password Reset',
      html: makeANiceEmail(`Your Password Reset token is here! 
      \n\n <a href=${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}>
      Click here to reset</a>`)
    })
    
    return { message: 'Thanks!'}
  },

  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the password match
    if (args.password !== args.confirmPassword) {
      throw new Error(" Your password don't match ")
    }
    // 2. check if its a legit reset token
    // 3. Check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      },
    });
    if (!user) {
      throw new Error('This is either invalid or expired')
    }
    // 4. Hash thier new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      }
    })
    // 6. Generate JWT
    const token = jwt.sign({
      userId: updatedUser.id
    }, process.env.APP_SECRET)
    // 7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    // 8. return the new user
    return updatedUser;
  },
  async updatePermission(parent, args, ctx, info) {
    // 1. check if theey are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged In !');
    }
    // 2. query the current user
    const currentUser  = await ctx.db.query.user({
      where: {
        id: ctx.request.userId, 
      }, 
    }, info);
    // 3. check if they have permission to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4. update the permissions
    return ctx.db.mutation.updateUser({
      data: {
        permissions: {
          // We are using set because Permission has its own enum in the dataModel
          set: args.permissions,
        }
      },
      where: {
        id: args.userId
      }
    }, info);
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged In !');
    }
    // 2. Query the users current cart
    const [ existingCartItem ] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      }
    });
    // 3. Check if that items is already in their cart and increment by 1 if it is
    if (existingCartItem) {  
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1}
      }, info);
    }
    // 4. If its not, create a fresh cartItem for that user
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId }
        },
        item: {
          connect: { id: args.id }
        } 
      }
    }, info)
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. find the cart item
    const cartItem = await ctx.db.query.cartItem({
      where: {
          id: args.id, 
        }
      },  `{ id, user { id }}`
    );

    if (!cartItem) throw new Error('No CartItem Found');

    // 2. make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("You don't have permission to perform this action");
    }
    // 3. Delete that cart item
    return await ctx.db.mutation.deleteCartItem({
      where: { id: args.id },
    }, info);
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be logged In !');
    }

    const user = await ctx.db.query.user({
      where: {
          id: userId, 
        }
      },  `{
              id 
              name 
              email 
              cart 
              { 
                id 
                quantity 
                item 
                { 
                  title 
                  price 
                  id 
                  description 
                  image 
                  largeImage
                } 
              }
            }`
    );

    // 2. recalculate the total for the price
    const amount  = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0 
      );
      console.log(`Going to charge or a total of ${amount}`);
      
    // 3. create the cstripe charge (turn token into money)
      const charge = await stripe.charges.create({
        amount: amount,
        currency: 'USD',
        source: args.token,
      })

    // 4. convert the cartItems to OrderItems
      const orderItems = user.cart.map(cartItem => {
        const orderItem = {
          ...cartItem.item,
          quantity: cartItem.quantity,
          user: { connect: { id: userId }},
        };
        // we don't need the id from the cartItem, so we delete it
        delete orderItem.id;
        return orderItem
      })

    // 5. Create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect:  { id: userId } },
      }
    })
    // 6. Clean up - clear the user cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      }
    })
    // 7. Return the order to the client
    return order;

  }
};

module.exports = Mutations;
