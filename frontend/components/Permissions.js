import { Query, Mutation } from 'react-apollo';
import Error from './ErrorMessage';
import gql from 'graphql-tag';
import Table from './styles/Table';
import SickButton from './styles/SickButton';
import Proptypes from 'prop-types';


const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermission($permissions: [Permission],  $userId: ID!) {
    updatePermission(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`;

const ALL_USER_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`

const possiblePermissions  = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
];

const Permissions = (props) => (
  <Query query={ALL_USER_QUERY}>
    {({ data, loading, error}) => (
      <div> 
        <Error error={error} />
        <div>
          <h2>Manage Permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
                <th>👇🏽</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => <UserPermissions user={user} key={user.id}/>)}
            </tbody>
          </Table>
        </div>
      </div>

    )}
  </Query>
)

class UserPermissions extends React.Component {
  static propTypes = {
    user: Proptypes.shape({
      id: Proptypes.string,
      email: Proptypes.string,
      permission: Proptypes.array,
      name: Proptypes.name
    }).isRequired
  };

  state = {
    permissions: this.props.user.permissions
  }

  handlePermissionChange = (e, updatePermissions) => {
    const checkbox  = e.target;
    let updatedPermissions = [...this.state.permissions]
    // figure out if we need to remove or add this permission
    if (checkbox.checked){
      // add it in
      updatedPermissions.push(checkbox.value)
    } else {
      // loop through and remove it.
      updatedPermissions = updatedPermissions.filter(
        permission => permission !== checkbox.value
      )
    }
    this.setState({
      permissions: updatedPermissions
    }, updatePermissions)
  }
  render() {
    const {user: { name, email, id }}  = this.props;
    return (
      <Mutation 
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables= {{ 
          permissions: this.state.permissions,
          userId: this.props.user.id
        }}
        >
        { (updatePermission, { loading, error }) => (
          <>
            { error && <tr><td colSpan="8"><Error error={error} /></td></tr> }
            <tr>
              <td>{name}</td>
              <td>{email}</td>
              { possiblePermissions.map(permission => (
                <td key={permission}>
                  <label htmlFor={`${id}-permission-${permission}`}>
                    <input 
                      type="checkbox" 
                      id={`${id}-permission-${permission}`}
                      checked={this.state.permissions.includes(permission)}
                      value={permission}
                      onChange={(e) => this.handlePermissionChange(e, updatePermission)}
                      />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermission}
                >Updat{loading ? 'ing' : 'e'}</SickButton>
              </td>
            </tr>
          </>
        )} 
      </Mutation>
    );
  }
}

export default Permissions;