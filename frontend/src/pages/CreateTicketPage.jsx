import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTicketStart, createTicketSuccess, createTicketFailure } from '../redux/ticketSlice';
import { createTicket } from '../api/ticketsApi';
import './TicketPages.css';

const CreateTicketPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Bug',
    priority: 'Medium'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(createTicketStart());

    try {
      const response = await createTicket(formData);
      if (response.success) {
        dispatch(createTicketSuccess(response.data));
        navigate(`/tickets/${response.data._id}`);
      } else {
        setError(response.message);
        dispatch(createTicketFailure(response.message));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create ticket';
      setError(errorMsg);
      dispatch(createTicketFailure(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ticket-form-page">
      <div className="container">
        <div className="form-card">
          <h1>Create New Ticket</h1>

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
                placeholder="Brief title of the issue"
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
                placeholder="Detailed description of the issue"
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Ticket'}
              </button>
              <button type="button" onClick={() => navigate('/tickets')} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
