import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStatsStart, fetchStatsSuccess, fetchStatsFailure } from '../redux/dashboardSlice';
import { getDashboardStats } from '../api/dashboardApi';
import './DashboardPage.css';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, loading } = useSelector(state => state.dashboard);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    const fetchStats = async () => {
      dispatch(fetchStatsStart());
      try {
        const response = await getDashboardStats();
        if (response.success) {
          dispatch(fetchStatsSuccess(response.data));
        }
      } catch (error) {
        dispatch(fetchStatsFailure(error.message));
      }
    };

    if (user?.role === 'Admin' || user?.role === 'Agent') {
      fetchStats();
    }
  }, [dispatch, user?.role]);

  if (user?.role === 'User') {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1>Welcome, {user?.name}!</h1>
          <p className="subtitle">Manage your support tickets</p>

          <div className="user-dashboard">
            <div className="dashboard-card">
              <h3>Create a New Ticket</h3>
              <p>Get help with any issue you're facing</p>
              <button onClick={() => navigate('/tickets/create')} className="btn btn-primary">
                Create Ticket
              </button>
            </div>

            <div className="dashboard-card">
              <h3>My Tickets</h3>
              <p>View and manage your support tickets</p>
              <button onClick={() => navigate('/tickets')} className="btn btn-primary">
                View Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>Dashboard</h1>
        <p className="subtitle">System overview and statistics</p>

        {loading ? (
          <p className="loading">Loading statistics...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalTickets}</div>
              <div className="stat-label">Total Tickets</div>
            </div>

            <div className="stat-card open">
              <div className="stat-value">{stats.openTickets}</div>
              <div className="stat-label">Open Tickets</div>
            </div>

            <div className="stat-card in-progress">
              <div className="stat-value">{stats.inProgressTickets}</div>
              <div className="stat-label">In Progress</div>
            </div>

            <div className="stat-card resolved">
              <div className="stat-value">{stats.resolvedTickets}</div>
              <div className="stat-label">Resolved</div>
            </div>

            <div className="stat-card closed">
              <div className="stat-value">{stats.closedTickets}</div>
              <div className="stat-label">Closed</div>
            </div>

            <div className="stat-card urgent">
              <div className="stat-value">{stats.urgentTickets}</div>
              <div className="stat-label">Urgent</div>
            </div>

            {user?.role === 'Admin' && (
              <>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">{stats.agentCount}</div>
                  <div className="stat-label">Agents</div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button onClick={() => navigate('/tickets')} className="btn btn-primary">
              View All Tickets
            </button>
            {user?.role === 'Admin' && (
              <>
                <button onClick={() => navigate('/users')} className="btn btn-primary">
                  Manage Users
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
