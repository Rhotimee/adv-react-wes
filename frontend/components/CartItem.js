import React from 'react'
import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import RemoveFromCart from './RemoveFromCart';

const CartItemStyles  = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey };
  display: grid;
  align-items: center;
  grid-template-columns: auton 1fr auto;
  img {
    margin-right: 10px;
  }
  h3, p {
    margin: 0;
  }
`;

const CartItem  = (props) => {
  if (!props.cartItem.item) return <CartItemStyles>
    This Item has been removed.
    <RemoveFromCart id={props.cartItem.id}/>
  </CartItemStyles>;
  const { title, image, description, price, } = props.cartItem.item;
  return (
    <CartItemStyles>
      <img width="100" src={image} alt={title}/>
      <div className="cart-item-details">
        <h3>{title}</h3>
        <p>
          {formatMoney(price * props.cartItem.quantity) }
          {' - '}
          <em>
            {props.cartItem.quantity} &times; {formatMoney(price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={props.cartItem.id}/>
    </CartItemStyles>
)}

CartItem.prototype = {
  cartItem: PropTypes.object.isRequired,

}

export default CartItem; 