import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import './Header.css';

const Header = ({ user }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            QTechy Tickets
          </Link>

          <nav className="navbar">
            <div className="nav-items">
              {/* Dashboard - All roles */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Dashboard
              </NavLink>

              {/* Tickets */}
              {user?.role === 'Admin' && (
                <NavLink
                  to="/tickets"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  All Tickets
                </NavLink>
              )}

              {user?.role === 'Agent' && (
                <NavLink
                  to="/tickets"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Assigned Tickets
                </NavLink>
              )}

              {user?.role === 'User' && (
                <>
                  <NavLink
                    to="/tickets/create"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Create Ticket
                  </NavLink>
                  <NavLink
                    to="/tickets"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    My Tickets
                  </NavLink>
                </>
              )}

              {/* User Management - Admin only */}
              {user?.role === 'Admin' && (
                <NavLink
                  to="/users"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  User Management
                </NavLink>
              )}

              {/* User Info and Logout */}
              <div className="user-section">
                <span className="user-info">
                  {user?.name} ({user?.role})
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
