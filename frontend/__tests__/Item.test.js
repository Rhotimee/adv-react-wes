import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';


const fakeItem = {
  id: 'ABC123',
  title: 'A cool Item',
  price: 5000,
  description: 'This item os really cool!',
  image: 'dog.jpg',
  largeImage: 'largedog.jpg',
}

const wrapper = shallow(<ItemComponent item={fakeItem}/>) 

describe('<item/>', () => {
  it('renders and matches the snapshot', () => {
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
  // it('should render image correctly', () => {
  //   const img = wrapper.find('img');
  //   console.log(img.props()) 
  //   expect(img.props().src).toBe(fakeItem.image)
  // })
  
  // it('should render price tag correctly', () => {
  //   const PriceTag = wrapper.find('PriceTag')
  //   console.log(PriceTag.debug());
  //   expect(PriceTag.children().text()).toBe('$50');
  //   expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
  // })

  // it('should render buttons correctly', () => {
  //   const buttonList = wrapper.find('.buttonList')
  //   expect(buttonList.children()).toHaveLength(3)
  //   console.log(buttonList.children());
  //   expect(buttonList.find('Link')).toHaveLength(1);
  //   expect(buttonList.find('Link').exists()).toBe(true);
  //   expect(buttonList.find('AddToCart').exists()).toBe(true);
  //   expect(buttonList.find('DeleteItem').exists()).toBe(true);
  // })
})