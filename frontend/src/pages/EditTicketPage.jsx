import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchTicketStart, fetchTicketSuccess, fetchTicketFailure, updateTicketStart, updateTicketSuccess, updateTicketFailure } from '../redux/ticketSlice';
import { getTicketById, updateTicket } from '../api/ticketsApi';
import './TicketPages.css';

const EditTicketPage = () => {
  const { ticketId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      dispatch(fetchTicketStart());
      try {
        const response = await getTicketById(ticketId);
        if (response.success) {
          const { title, description, category, priority } = response.data;
          setFormData({ title, description, category, priority });
          dispatch(fetchTicketSuccess(response.data));
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load ticket';
        setError(errorMsg);
        dispatch(fetchTicketFailure(errorMsg));
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    dispatch(updateTicketStart());

    try {
      const response = await updateTicket(ticketId, formData);
      if (response.success) {
        dispatch(updateTicketSuccess(response.data));
        navigate(`/tickets/${ticketId}`);
      } else {
        setError(response.message);
        dispatch(updateTicketFailure(response.message));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update ticket';
      setError(errorMsg);
      dispatch(updateTicketFailure(errorMsg));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="loading">Loading ticket...</p>;

  return (
    <div className="ticket-form-page">
      <div className="container">
        <div className="form-card">
          <h1>Edit Ticket</h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange}>
                  <option value="Bug">Bug</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Ticket'}
              </button>
              <button type="button" onClick={() => navigate(`/tickets/${ticketId}`)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTicketPage;
