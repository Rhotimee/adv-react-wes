import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import ItemStyles from './styles/ItemStyles';
import PriceTag from './styles/PriceTag';
import Title from './styles/Title';
import formatMoney from '../lib/formatMoney';
import DeleteItem from './DeleteItem';
import AddToCart from '../components/AddTocart'; 

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired, 
  }

  render() {
    const { item } = this.props;
    return (
    <ItemStyles>
      {item.image && <img src={item.image} alt={item.image}/>}
      <Title>
        <Link href={{
          pathname: '/item',
          query: {id: item.id}
        }}>
          <a>
            {item.title}
          </a>
        </Link>
      </Title>
      <PriceTag>{formatMoney(item.price)}</PriceTag>
      <p>{item.description}</p>

      <div className="buttonList">
        <Link href={{
          pathname: "update",
          query: {id: item.id}
        }}><a>Edit ✏️</a></Link>
        <AddToCart id = {item.id}/>
        <DeleteItem id={item.id}>Delete This Item </DeleteItem>
      </div>     
    </ItemStyles>
    );
  }
}
