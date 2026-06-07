import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure } from '../redux/userSlice';
import { getAllUsers } from '../api/usersApi';
import './TicketPages.css';

const UserManagementPage = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(state => state.users);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      dispatch(fetchUsersStart());
      try {
        const params = roleFilter ? { role: roleFilter } : {};
        const response = await getAllUsers(params);
        if (response.success) {
          dispatch(fetchUsersSuccess(response.data));
        }
      } catch (error) {
        dispatch(fetchUsersFailure(error.message));
      }
    };

    fetchUsers();
  }, [dispatch, roleFilter]);

  return (
    <div className="user-management-page">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Filter by Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Users</option>
              <option value="User">User</option>
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="loading">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="no-data">No users found</p>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
