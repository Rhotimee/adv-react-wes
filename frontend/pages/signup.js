import styled from 'styled-components';
import Signin from '../components/Signin';
import Signup from '../components/Signup';
import RequestSignup from '../components/RequestReset';

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

const signup = props => {
  return (
    <Columns>
      <Signup />
      <Signin />
      <RequestSignup />
    </Columns>
  )
}

export default signup