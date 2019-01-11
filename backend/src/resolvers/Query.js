const { forwardTo } = require('prisma-binding') 
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }

    return ctx.db.query.user({
      where: { id: ctx.request.userId }
    }, info);
  },
  async users(parent, args, ctx, info) {
    // 1. check if they are logged in
    if (!ctx.request.userId) {
      throw new Error('You must be logged In ') 
    }
    // 2. Check if the user has the permission to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // 3. If they do, query all the users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info){
    // 1. Make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged In");
    }
    // 2. Query the current order
    const order = await ctx.db.query.order({
      where: { id: args.id },
    }, info);
    // 3. check if they have the permission to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
    if (!ownsOrder || !hasPermissionToSeeOrder){
      throw new Error("You don't have the permission to see this order!")
    }
    // 4. Return the order
    return order
  },
  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;

    if (!userId) {
      throw new Error('You must be logged In ') 
    }

    return ctx.db.query.orders({
      where: {
        user: { id: userId } 
      }
    }, info)
  }
};

module.exports = Query;
