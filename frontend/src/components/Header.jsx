import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>

              {/* Tickets */}
              {user?.role === 'Admin' && (
                <Link to="/tickets" className="nav-link">
                  All Tickets
                </Link>
              )}

              {user?.role === 'Agent' && (
                <Link to="/tickets" className="nav-link">
                  Assigned Tickets
                </Link>
              )}

              {user?.role === 'User' && (
                <>
                  <Link to="/tickets/create" className="nav-link">
                    Create Ticket
                  </Link>
                  <Link to="/tickets" className="nav-link">
                    My Tickets
                  </Link>
                </>
              )}

              {/* User Management - Admin only */}
              {user?.role === 'Admin' && (
                <Link to="/users" className="nav-link">
                  User Management
                </Link>
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
