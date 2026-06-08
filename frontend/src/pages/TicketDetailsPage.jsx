import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTicketStart, fetchTicketSuccess, fetchTicketFailure, addCommentStart, addCommentSuccess, addCommentFailure, updateStatusStart, updateStatusSuccess, updateStatusFailure, deleteTicketStart, deleteTicketSuccess, deleteTicketFailure, updateTicketSuccess } from '../redux/ticketSlice';
import { getTicketById, addComment, updateTicketStatus, deleteTicket, assignTicket } from '../api/ticketsApi';
import { getAgents } from '../api/usersApi';
import './TicketPages.css';

const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentTicket: ticket, loading } = useSelector(state => state.tickets);

  const [commentText, setCommentText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [assignedAgent, setAssignedAgent] = useState('');
  const [agents, setAgents] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      dispatch(fetchTicketStart());
      try {
        const response = await getTicketById(ticketId);
        if (response.success) {
          dispatch(fetchTicketSuccess(response.data));
          setNewStatus(response.data.status);
          if (response.data.assignedTo) {
            setAssignedAgent(response.data.assignedTo._id);
          }
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load ticket';
        setError(errorMsg);
        dispatch(fetchTicketFailure(errorMsg));
      }
    };

    fetchTicket();
  }, [ticketId, dispatch]);

  useEffect(() => {
    const fetchAgents = async () => {
      if (user?.role !== 'Admin') return;
      try {
        const response = await getAgents();
        if (response.success) {
          setAgents(response.data);
        }
      } catch (err) {
        // ignore agent fetch failure; admin assignment remains optional
      }
    };

    fetchAgents();
  }, [user]);

  const handleAssignTicket = async (e) => {
    e.preventDefault();
    if (!assignedAgent) return;

    setSubmittingAssignment(true);
    try {
      const response = await assignTicket(ticketId, { assignedTo: assignedAgent });
      if (response.success) {
        dispatch(updateTicketSuccess(response.data));
        setAssignedAgent(response.data.assignedTo?._id || '');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    dispatch(addCommentStart());

    try {
      const response = await addComment(ticketId, { text: commentText });
      if (response.success) {
        dispatch(addCommentSuccess(response.data));
        setCommentText('');
      } else {
        setError(response.message);
        dispatch(addCommentFailure(response.message));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add comment';
      setError(errorMsg);
      dispatch(addCommentFailure(errorMsg));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmittingStatus(true);
    dispatch(updateStatusStart());

    try {
      const response = await updateTicketStatus(ticketId, { status: newStatus });
      if (response.success) {
        dispatch(updateStatusSuccess(response.data));
      } else {
        setError(response.message);
        dispatch(updateStatusFailure(response.message));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update status';
      setError(errorMsg);
      dispatch(updateStatusFailure(errorMsg));
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    dispatch(deleteTicketStart());
    try {
      const response = await deleteTicket(ticketId);
      if (response.success) {
        dispatch(deleteTicketSuccess(ticketId));
        navigate('/tickets');
      } else {
        setError(response.message);
        dispatch(deleteTicketFailure(response.message));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete ticket';
      setError(errorMsg);
      dispatch(deleteTicketFailure(errorMsg));
    }
  };

  if (loading) return <p className="loading">Loading ticket...</p>;
  if (!ticket) return <p className="error">Ticket not found</p>;

  const canEdit = user?._id === ticket.createdBy._id || user?.role === 'Admin';
  const canChangeStatus = user?.role === 'Admin' || user?.role === 'Agent';

  return (
    <div className="ticket-details-page">
      <div className="container">
        <button onClick={() => navigate('/tickets')} className="back-btn">
          ← Back to Tickets
        </button>

        <div className="ticket-details-card">
          <div className="ticket-header">
            <div>
              <h1>{ticket.title}</h1>
              <p className="ticket-number">{ticket.ticketNumber}</p>
            </div>
            <div className="ticket-badges">
              <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                {ticket.status}
              </span>
              <span className={`priority-badge ${ticket.priority.toLowerCase()}`}>
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="ticket-status-timeline">
            {['Open', 'In Progress', 'Resolved'].map((step, index) => {
              const effectiveStatus = ticket.status === 'Closed' ? 'Resolved' : ticket.status;
              const completed = ['Open', 'In Progress', 'Resolved'].indexOf(effectiveStatus) >= index;
              return (
                <div key={step} className={`timeline-step ${completed ? 'completed' : ''}`}>
                  <div className="step-circle">{index + 1}</div>
                  <div className="step-label">{step}</div>
                </div>
              );
            })}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="ticket-meta">
            <div className="meta-item">
              <span className="label">Category:</span>
              <span className="value">{ticket.category}</span>
            </div>
            <div className="meta-item">
              <span className="label">Created By:</span>
              <span className="value">{ticket.createdBy.name}</span>
            </div>
            <div className="meta-item">
              <span className="label">Assigned To:</span>
              <span className="value">{ticket.assignedTo?.name || 'Unassigned'}</span>
            </div>
            <div className="meta-item">
              <span className="label">Created:</span>
              <span className="value">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="ticket-description">
            <h2>Description</h2>
            <p>{ticket.description}</p>
          </div>

          {canChangeStatus && (
            <form onSubmit={handleUpdateStatus} className="status-update-form">
              <h3>Update Status</h3>
              <div className="form-row">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                <button type="submit" className="btn btn-primary" disabled={submittingStatus}>
                  {submittingStatus ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          )}

          {user?.role === 'Admin' && (
            <form onSubmit={handleAssignTicket} className="assignment-form">
              <h3>Assign Ticket</h3>
              <div className="form-row">
                <select
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select agent</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary" disabled={submittingAssignment}>
                  {submittingAssignment ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          )}

          {canEdit && (
            <button onClick={() => navigate(`/tickets/${ticketId}/edit`)} className="btn btn-secondary">
              Edit Ticket
            </button>
          )}
          {user?.role === 'Admin' && (
            <button onClick={handleDeleteTicket} className="btn btn-danger">
              Delete Ticket
            </button>
          )}

          <div className="comments-section">
            <h2>Comments</h2>
            <div className="comments-list">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user.name}</span>
                      <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="comment-form">
              <h3>Add a Comment</h3>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment here..."
                rows="4"
                required
              ></textarea>
              <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                {submittingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
