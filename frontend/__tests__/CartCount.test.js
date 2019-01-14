import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CartCount from '../components/CartCount';

describe('<CartCount />', () => {
  it('renders', () => {
    const wrapper = shallow(<CartCount count={10}/>);
    expect(toJSON(wrapper)).toMatchSnapshot();
    wrapper.setProps({ count: 30 })
    expect(toJSON(wrapper)).toMatchSnapshot();
  })

  it('updates via props', () => {
    const wrapper = shallow(<CartCount count={10}/>);
    expect(toJSON(wrapper)).toMatchSnapshot()
  })
})