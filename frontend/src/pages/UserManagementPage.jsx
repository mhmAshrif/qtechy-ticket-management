import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure, updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure } from '../redux/userSlice';
import { getAllUsers, updateUser, deleteUser } from '../api/usersApi';
import './TicketPages.css';

const UserManagementPage = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector(state => state.users);
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', role: '' });

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

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditFormData({ name: user.name, role: user.role });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({ name: '', role: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveUser = async (userId) => {
    dispatch(updateUserStart());
    try {
      const response = await updateUser(userId, editFormData);
      if (response.success) {
        dispatch(updateUserSuccess(response.data));
        handleCancelEdit();
      } else {
        dispatch(updateUserFailure(response.message));
        alert(response.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update user';
      dispatch(updateUserFailure(errorMsg));
      alert(errorMsg);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    dispatch(deleteUserStart());
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        dispatch(deleteUserSuccess(userId));
      } else {
        dispatch(deleteUserFailure(response.message));
        alert(response.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete user';
      dispatch(deleteUserFailure(errorMsg));
      alert(errorMsg);
    }
  };

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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="user-name">
                      {editingUserId === user._id ? (
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                        />
                      ) : (
                        user.name
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {editingUserId === user._id ? (
                        <select name="role" value={editFormData.role} onChange={handleEditChange}>
                          <option value="User">User</option>
                          <option value="Agent">Agent</option>
                          <option value="Admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="action-column">
                      {editingUserId === user._id ? (
                        <>
                          <button onClick={() => handleSaveUser(user._id)} className="btn btn-sm btn-primary">
                            Save
                          </button>
                          <button onClick={handleCancelEdit} className="btn btn-sm btn-secondary">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(user)} className="btn btn-sm btn-secondary">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteUser(user._id)} className="btn btn-sm btn-danger">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
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
