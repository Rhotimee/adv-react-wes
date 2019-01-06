import CreateItem from '../components/CreateItem';
import PleaseSignIn from '../components/PleaseSignin';

export default function index() {
  return (
    <div>
      <PleaseSignIn>
        <CreateItem />
      </PleaseSignIn>
    </div>
  )
}
