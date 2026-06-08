import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure, deleteTicketStart, deleteTicketSuccess, deleteTicketFailure, setFilters, updateTicketSuccess } from '../redux/ticketSlice';
import { getTickets, deleteTicket, assignTicket } from '../api/ticketsApi';
import { getAgents } from '../api/usersApi';
import './TicketPages.css';

const TicketListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { tickets, loading, pagination, filters } = useSelector(state => state.tickets);

  const [localFilters, setLocalFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: ''
  });
  const [agents, setAgents] = useState([]);
  const [assigningTicketId, setAssigningTicketId] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);

  const fetchTicketsData = useCallback(async () => {
    dispatch(fetchTicketsStart());
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await getTickets(params);
      if (response.success) {
        dispatch(fetchTicketsSuccess({
          tickets: response.data,
          pagination: response.pagination
        }));
      }
    } catch (error) {
      dispatch(fetchTicketsFailure(error.message));
    }
  }, [dispatch, filters, pagination.limit, pagination.page]);

  useEffect(() => {
    fetchTicketsData();
  }, [fetchTicketsData]);

  useEffect(() => {
    const fetchAgentsData = async () => {
      if (user?.role !== 'Admin') return;
      try {
        const response = await getAgents();
        if (response.success) {
          setAgents(response.data);
        }
      } catch (err) {
        // ignore agent fetch failure
      }
    };

    fetchAgentsData();
  }, [user?.role]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    fetchTicketsData();
  };

  const handleResetFilters = () => {
    setLocalFilters({
      status: '',
      priority: '',
      category: '',
      search: ''
    });
    dispatch(setFilters({
      status: null,
      priority: null,
      category: null,
      search: null
    }));
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    dispatch(deleteTicketStart());
    try {
      const response = await deleteTicket(ticketId);
      if (response.success) {
        dispatch(deleteTicketSuccess(ticketId));
      } else {
        dispatch(deleteTicketFailure(response.message));
        alert(response.message);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete ticket';
      dispatch(deleteTicketFailure(errorMsg));
      alert(errorMsg);
    }
  };

  const handleOpenAssignModal = (ticketId) => {
    setAssigningTicketId(ticketId);
    setSelectedAgent('');
  };

  const handleCloseAssignModal = () => {
    setAssigningTicketId(null);
    setSelectedAgent('');
  };

  const handleAssignTicket = async () => {
    if (!selectedAgent) return;

    setAssigningLoading(true);
    try {
      const response = await assignTicket(assigningTicketId, { assignedTo: selectedAgent });
      if (response.success) {
        dispatch(updateTicketSuccess(response.data));
        handleCloseAssignModal();
      } else {
        alert(response.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setAssigningLoading(false);
    }
  };

  return (
    <div className="ticket-list-page">
      <div className="container">
        <div className="page-header">
          <h1>
            {user?.role === 'User' ? 'My Tickets' : user?.role === 'Agent' ? 'Assigned Tickets' : 'All Tickets'}
          </h1>
          {user?.role === 'User' && (
            <button onClick={() => navigate('/tickets/create')} className="btn btn-primary">
              + Create Ticket
            </button>
          )}
        </div>

        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={localFilters.search}
                onChange={handleFilterChange}
                placeholder="Search by title, description..."
              />
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select name="status" value={localFilters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Priority</label>
              <select name="priority" value={localFilters.priority} onChange={handleFilterChange}>
                <option value="">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={localFilters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="Bug">Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Account Issue">Account Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={handleApplyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={handleResetFilters} className="btn btn-secondary">
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <p className="loading">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="no-data">No tickets found</p>
        ) : (
          <>
            <div className="tickets-table">
              <table>
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th>Created</th>
                    {user?.role === 'Admin' && <th>Assigned To</th>}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket._id}>
                      <td className="ticket-number">{ticket.ticketNumber}</td>
                      <td className="title">{ticket.title}</td>
                      <td>
                        <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>{ticket.category}</td>
                      <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      {user?.role === 'Admin' && (
                        <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                      )}
                      <td className="action-column">
                        <button
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </button>
                        {user?.role === 'Admin' && (
                          <>
                            <button
                              onClick={() => handleOpenAssignModal(ticket._id)}
                              className="btn btn-sm btn-info"
                            >
                              Assign
                            </button>
                            <button
                              onClick={() => navigate(`/tickets/${ticket._id}/edit`)}
                              className="btn btn-sm btn-secondary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTicket(ticket._id)}
                              className="btn btn-sm btn-danger"
                            >
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

            <div className="pagination">
              <button
                onClick={() => dispatch({ type: 'tickets/setPage', payload: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>{pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => dispatch({ type: 'tickets/setPage', payload: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </>
        )}

        {assigningTicketId && (
          <div className="modal-overlay">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Assign Ticket</h3>
                  <button onClick={handleCloseAssignModal} className="modal-close">&times;</button>
                </div>
                <div className="modal-body">
                  <label htmlFor="agent-select">Select Agent:</label>
                  <select
                    id="agent-select"
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Choose an agent</option>
                    {agents.map(agent => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-footer">
                  <button onClick={handleCloseAssignModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignTicket}
                    className="btn btn-primary"
                    disabled={!selectedAgent || assigningLoading}
                  >
                    {assigningLoading ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketListPage;
