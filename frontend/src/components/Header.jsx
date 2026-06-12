import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import './Header.css';

const Header = ({ user }) => {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    closeMenu();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            QTechy Tickets
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
            <div className="nav-items">
              {/* Dashboard - All roles */}
              <NavLink
                to="/dashboard"
                onClick={handleNavClick}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Dashboard
              </NavLink>

              {/* Tickets */}
              {user?.role === 'Admin' && (
                <NavLink
                  to="/tickets"
                  onClick={handleNavClick}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  All Tickets
                </NavLink>
              )}

              {user?.role === 'Agent' && (
                <NavLink
                  to="/tickets"
                  onClick={handleNavClick}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  Assigned Tickets
                </NavLink>
              )}

              {user?.role === 'User' && (
                <>
                  <NavLink
                    to="/tickets/create"
                    onClick={handleNavClick}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Create Ticket
                  </NavLink>
                  <NavLink
                    to="/tickets"
                    onClick={handleNavClick}
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
                  onClick={handleNavClick}
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
