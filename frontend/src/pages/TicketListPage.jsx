import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTicketsStart, fetchTicketsSuccess, fetchTicketsFailure, setFilters } from '../redux/ticketSlice';
import { getTickets } from '../api/ticketsApi';
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

  useEffect(() => {
    fetchTicketsData();
  }, [pagination.page]);

  const fetchTicketsData = async () => {
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
  };

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
                      <td>
                        <button
                          onClick={() => navigate(`/tickets/${ticket._id}`)}
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </button>
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
      </div>
    </div>
  );
};

export default TicketListPage;
