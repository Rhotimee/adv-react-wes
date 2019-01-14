import { mount } from 'enzyme';
import wait from 'waait';
import PleaseSignin from '../components/PleaseSignin';
import { CURRENT_USER_QUERY } from '../components/User'
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser } from '../lib/testUtils';

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } },
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } },
  }
]

describe('<PleaseSignin />', () => {
  it('renders the sign in dialog to logged out users', async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignin />
      </MockedProvider>
    );
    console.log(wrapper.debug());
    await wait()
    wrapper.update()
    console.log(wrapper.debug());
    expect(wrapper.text()).toContain('Please Signin before continuing') 
    expect(wrapper.find('Signin').exists()).toBe(true);
  })

  it('renders the child component when the user is signed in', async () => {
    // signedIN needs a child componenet. 
    // So, we create a simple child componenet. 
    const hi = () => <p>Hi</p>
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <hi />
      </MockedProvider> 
    );

    await wait();
    wrapper.update();
    console.log(wrapper.debug());
    expect(wrapper.contains(<hi />)).toBe(true);
    expect(wrapper).toMatchSnapshot();
  })
})