import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketListPage from './pages/TicketListPage';
import CreateTicketPage from './pages/CreateTicketPage';
import EditTicketPage from './pages/EditTicketPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import UserManagementPage from './pages/UserManagementPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';

import './App.css';

function App() {
  const { isAuthenticated, user } = useSelector(state => state.auth);


  return (
    <Router>
      {isAuthenticated && <Header user={user} />}
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* Ticket Routes */}
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute>
              <TicketListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets/create" 
          element={
            <ProtectedRoute allowedRoles={['User', 'Admin']}>
              <CreateTicketPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets/:ticketId" 
          element={
            <ProtectedRoute>
              <TicketDetailsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets/:ticketId/edit" 
          element={
            <ProtectedRoute>
              <EditTicketPage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;

