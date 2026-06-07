import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTicketStart, fetchTicketSuccess, fetchTicketFailure, addCommentStart, addCommentSuccess, addCommentFailure, updateStatusStart, updateStatusSuccess, updateStatusFailure } from '../redux/ticketSlice';
import { getTicketById, addComment, updateTicketStatus } from '../api/ticketsApi';
import './TicketPages.css';

const TicketDetailsPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentTicket: ticket, loading } = useSelector(state => state.tickets);

  const [commentText, setCommentText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      dispatch(fetchTicketStart());
      try {
        const response = await getTicketById(ticketId);
        if (response.success) {
          dispatch(fetchTicketSuccess(response.data));
          setNewStatus(response.data.status);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load ticket';
        setError(errorMsg);
        dispatch(fetchTicketFailure(errorMsg));
      }
    };

    fetchTicket();
  }, [ticketId, dispatch]);

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

  if (loading) return <p className="loading">Loading ticket...</p>;
  if (!ticket) return <p className="error">Ticket not found</p>;

  const canEdit = user?._id === ticket.createdBy._id || user?.role === 'Admin' || user?.role === 'Agent';
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

          {canEdit && (
            <button onClick={() => navigate(`/tickets/${ticketId}/edit`)} className="btn btn-secondary">
              Edit Ticket
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
