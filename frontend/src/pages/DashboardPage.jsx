import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStatsStart, fetchStatsSuccess, fetchStatsFailure } from '../redux/dashboardSlice';
import { getDashboardStats } from '../api/dashboardApi';
import { getTickets } from '../api/ticketsApi';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import './DashboardPage.css';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stats, loading } = useSelector(state => state.dashboard);
  const { user } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTickets, setUserTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketError, setTicketError] = useState(null);
  const [agentTickets, setAgentTickets] = useState([]);
  const [agentTicketsLoading, setAgentTicketsLoading] = useState(false);
  const [agentTicketError, setAgentTicketError] = useState(null);
  const [agentFilter, setAgentFilter] = useState('requiresAction');

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

  const statusChartData = stats.ticketsByStatus || [];
  const categoryChartData = stats.ticketsByCategory || [];
  const chartColors = ['#667eea', '#48bb78', '#f6ad55', '#ed64a6', '#63b3ed', '#f56565'];

  useEffect(() => {
    const fetchUserTickets = async () => {
      setTicketsLoading(true);
      setTicketError(null);

      try {
        const response = await getTickets({ search: searchTerm, page: 1, limit: 10 });
        if (response.success) {
          setUserTickets(response.data);
        }
      } catch (error) {
        setTicketError(error.response?.data?.message || 'Failed to load tickets');
      } finally {
        setTicketsLoading(false);
      }
    };

    if (user?.role === 'User') {
      fetchUserTickets();
    }
  }, [user?.role, searchTerm]);

  const ticketNeedsAttention = (ticket) => {
    const attentionKeywords = [
      'more information',
      'need more info',
      'please provide',
      'need additional details',
      'clarification',
      'required information'
    ];

    return ticket.comments?.some(comment => {
      const fromAgent = comment.user?.role === 'Agent';
      const text = comment.text?.toLowerCase() || '';
      return fromAgent && attentionKeywords.some(keyword => text.includes(keyword));
    });
  };

  const attentionTickets = userTickets.filter(ticketNeedsAttention);

  const getLastCommentRole = (ticket) => {
    const comments = ticket.comments || [];
    if (!comments.length) return null;
    const lastComment = comments[comments.length - 1];
    return lastComment.user?.role || null;
  };

  const getTicketActionStatus = (ticket) => {
    if (!['Open', 'In Progress'].includes(ticket.status)) return 'None';
    const lastRole = getLastCommentRole(ticket);
    if (!lastRole || lastRole === 'User') return 'Requires My Action';
    if (lastRole === 'Agent') return 'Waiting on User Reply';
    return 'Requires My Action';
  };

  const formatTimeOpen = (ticket) => {
    const createdAt = new Date(ticket.createdAt || ticket.updatedAt || Date.now());
    const now = new Date();
    const diffMs = now - createdAt;
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h open`;
    }
    return `${diffHours}h open`;
  };

  const filteredAgentTickets = agentTickets.filter(ticket => {
    if (agentFilter === 'all') return true;
    if (agentFilter === 'requiresAction') return getTicketActionStatus(ticket) === 'Requires My Action';
    if (agentFilter === 'waitingOnUser') return getTicketActionStatus(ticket) === 'Waiting on User Reply';
    return true;
  });

  useEffect(() => {
    const fetchAgentTickets = async () => {
      if (user?.role !== 'Agent') return;
      setAgentTicketsLoading(true);
      setAgentTicketError(null);
      try {
        const response = await getTickets({ assignedTo: user._id, page: 1, limit: 20 });
        if (response.success) {
          setAgentTickets(response.data);
        } else {
          setAgentTicketError(response.message || 'Failed to load assigned tickets');
        }
      } catch (error) {
        setAgentTicketError(error.response?.data?.message || 'Failed to load assigned tickets');
      } finally {
        setAgentTicketsLoading(false);
      }
    };

    fetchAgentTickets();
  }, [user?.role, user?._id]);

  if (user?.role === 'User') {
    return (
      <div className="dashboard-page">
        <div className="container">
          <h1>Welcome, {user?.name}!</h1>
          <p className="subtitle">Manage your support tickets</p>

          <div className="dashboard-card user-dashboard-card">
            <h3>Quick Search</h3>
            <p>Find tickets by ticket number or keywords from the title.</p>
            <div className="dashboard-search">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          {attentionTickets.length > 0 && (
            <div className="alert-card attention-alert">
              <h3>Needs Attention</h3>
              <p>
                {attentionTickets.length} ticket{attentionTickets.length > 1 ? 's' : ''} need more information from you. Please review them below.
              </p>
              <ul>
                {attentionTickets.map(ticket => (
                  <li key={ticket._id}>
                    <button className="link-button" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                      {ticket.ticketNumber} - {ticket.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="user-dashboard-list">
            <div className="dashboard-card">
              <h3>My Recent Tickets</h3>
              {ticketsLoading ? (
                <p className="loading">Loading tickets...</p>
              ) : ticketError ? (
                <p className="error">{ticketError}</p>
              ) : userTickets.length === 0 ? (
                <p>No tickets found. Create a new ticket to get support.</p>
              ) : (
                <div className="tickets-list">
                  {userTickets.map(ticket => (
                    <div key={ticket._id} className="ticket-list-item">
                      <div className="ticket-list-info">
                        <div className="ticket-list-header">
                          <span className="ticket-number">{ticket.ticketNumber}</span>
                          {ticketNeedsAttention(ticket) && <span className="attention-badge">Needs Attention</span>}
                        </div>
                        <h4>{ticket.title}</h4>
                        <div className="ticket-meta-row">
                          <span className="status-label">{ticket.status}</span>
                          <span className="ticket-category">{ticket.category}</span>
                        </div>
                      </div>
                      <div className="ticket-list-actions">
                        <button className="btn btn-primary" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="quick-actions">
            <h2>Actions</h2>
            <div className="action-buttons">
              <button onClick={() => navigate('/tickets/create')} className="btn btn-primary">
                Create Ticket
              </button>
              <button onClick={() => navigate('/tickets')} className="btn btn-secondary">
                View All My Tickets
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
          <>
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

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button onClick={() => navigate('/tickets')} className="btn btn-primary">
                  View All Tickets
                </button>
                {user?.role === 'Admin' && (
                  <button onClick={() => navigate('/users')} className="btn btn-primary">
                    Manage Users
                  </button>
                )}
              </div>
            </div>

            {user?.role === 'Agent' && (
              <div className="agent-dashboard-panel">
                <div className="dashboard-card agent-dashboard-card">
                  <h3>Your Assigned Tickets</h3>
                  <p>Quickly identify urgent requests and tickets that need your response.</p>
                  <div className="filter-buttons">
                    <button
                      className={`filter-button ${agentFilter === 'all' ? 'selected' : ''}`}
                      onClick={() => setAgentFilter('all')}
                    >
                      All Assigned
                    </button>
                    <button
                      className={`filter-button ${agentFilter === 'requiresAction' ? 'selected' : ''}`}
                      onClick={() => setAgentFilter('requiresAction')}
                    >
                      Requires My Action
                    </button>
                    <button
                      className={`filter-button ${agentFilter === 'waitingOnUser' ? 'selected' : ''}`}
                      onClick={() => setAgentFilter('waitingOnUser')}
                    >
                      Waiting on User Reply
                    </button>
                  </div>

                  {agentTicketsLoading ? (
                    <p className="loading">Loading assigned tickets...</p>
                  ) : agentTicketError ? (
                    <p className="error">{agentTicketError}</p>
                  ) : filteredAgentTickets.length === 0 ? (
                    <p>No assigned tickets match this filter.</p>
                  ) : (
                    <div className="tickets-list">
                      {filteredAgentTickets.map(ticket => (
                        <div
                          key={ticket._id}
                          className={`ticket-list-item ${ticket.priority === 'Urgent' ? 'urgent-ticket' : ''}`}
                        >
                          <div className="ticket-list-info">
                            <div className="ticket-list-header">
                              <span className="ticket-number">{ticket.ticketNumber}</span>
                              {ticket.priority === 'Urgent' && <span className="priority-pill urgent">Urgent</span>}
                              <span className="status-label">{ticket.status}</span>
                            </div>
                            <h4>{ticket.title}</h4>
                            <div className="ticket-meta-row">
                              <span className="time-open">{formatTimeOpen(ticket)}</span>
                              <span className="ticket-category">{ticket.category}</span>
                              <span className="ticket-action-status">{getTicketActionStatus(ticket)}</span>
                            </div>
                          </div>
                          <div className="ticket-list-actions">
                            <button className="btn btn-primary" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {user?.role === 'Admin' && (
              <>
                <div className="chart-grid">
                  <div className="chart-card">
                    <h3>Tickets by Status</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          fill="#8884d8"
                          label
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Tickets by Category</h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={categoryChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#667eea" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="admin-panels">
                  <div className="panel-card">
                    <h3>Agent Workload</h3>
                    <div className="workload-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Agent</th>
                            <th>Open Tickets</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.agentWorkload.map(agent => (
                            <tr key={agent.agentId}>
                              <td>{agent.agentName}</td>
                              <td>{agent.openCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="panel-card">
                    <h3>Recent Activity</h3>
                    <ul className="recent-activity-list">
                      {stats.recentActivity.map((item, index) => (
                        <li key={index}>
                          <div className="activity-text">{item.text}</div>
                          <div className="activity-time">{new Date(item.date).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
