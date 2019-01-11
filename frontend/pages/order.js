import PleaseSignIn from '../components/PleaseSignin';
import Order from '../components/Order';

const OrderPage = ({query}) => {
  return (
    <div>
      <PleaseSignIn>
        <Order id={query.id}/>
      </PleaseSignIn>
    </div>
  )
}


export default OrderPage