import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDiscussionForum = () => {
  const [threads, setThreads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditThreadModal, setShowEditThreadModal] = useState(false);
  const [showEditReplyModal, setShowEditReplyModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedReply, setSelectedReply] = useState(null);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Redirect non-admin users
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/');
    }
  }, [role, navigate]);

  // Fetch threads and replies
  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/threads`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setThreads(response.data);
    } catch (err) {
      toast.error('Error fetching threads');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchReplies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/replies`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReplies(response.data);
    } catch (err) {
      toast.error('Error fetching replies');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (role === 'admin') {
      fetchThreads();
      fetchReplies();
    }
  }, [role, fetchThreads, fetchReplies]);

  const handleDeleteThread = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/threads/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      await fetchThreads();
      await fetchReplies();

      toast.success('Thread and its replies deleted successfully');
      setError('');
    } catch (err) {
      toast.error('Error deleting thread');
      setSuccess('');
    }
  };

  const handleEditThread = async () => {
    try {
      // Send a PUT request to update the thread
      await axios.put(
        `${API_BASE_URL}/api/threads/${selectedThread._id}`, // Correct endpoint
        selectedThread, // Updated thread data
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
  
      // Fetch updated threads to reflect the changes
      await fetchThreads();
  
      // Show success message and close the modal
      toast.success('Thread updated successfully');
      setError('');
      setShowEditThreadModal(false);
    } catch (err) {
      toast.error('Error updating thread');
      setSuccess('');
    }
  };

  const handleEditReply = async () => {
    try {
      // Send a PUT request to update the reply
      await axios.put(
        `${API_BASE_URL}/api/replies/${selectedReply._id}`, // Correct endpoint
        selectedReply, // Updated reply data
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
  
      // Fetch updated replies to reflect the changes
      await fetchReplies();
  
      // Show success message and close the modal
      toast.success('Reply updated successfully');
      setError('');
      setShowEditReplyModal(false);
    } catch (err) {
      toast.error('Error updating reply');
      setSuccess('');
    }
  };

  const handleDeleteReply = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/replies/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      await fetchReplies();

      toast.success('Reply deleted successfully');
      setError('');
    } catch (err) {
      toast.error('Error deleting reply');
      setSuccess('');
    }
  };

  if (role !== 'admin') {
    return (
      <Container className="mt-4">
        <h2>Access Denied</h2>
        <Alert variant="danger">You do not have permission to access this page.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ padding: '20px', marginBottom: '80px' }}>
      <h2 className="text-center mb-4">Admin Discussion Forum</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <h3>Threads</h3>
          <Table responsive striped bordered hover className="mb-4">
            <thead className="bg-dark text-white">
              <tr>
                <th>Title</th>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {threads.map((thread) => (
                <tr key={thread._id}>
                  <td style={{ wordWrap: 'break-word', maxWidth: '200px' }}>{thread.title}</td>
                  <td style={{ wordWrap: 'break-word', maxWidth: '400px' }}>{thread.content}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => {
                        setSelectedThread(thread);
                        setShowEditThreadModal(true);
                      }}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteThread(thread._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h3>Replies</h3>
          <Table responsive striped bordered hover className="mb-4">
            <thead className="bg-dark text-white">
              <tr>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((reply) => (
                <tr key={reply._id}>
                  <td style={{ wordWrap: 'break-word', maxWidth: '400px' }}>{reply.content}</td>
                  <td>
                    <Button
                      variant="warning"
                      onClick={() => {
                        setSelectedReply(reply);
                        setShowEditReplyModal(true);
                      }}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteReply(reply._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {/* Edit Thread Modal */}
      <Modal show={showEditThreadModal} onHide={() => setShowEditThreadModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Thread</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={selectedThread?.title || ''}
                onChange={(e) => setSelectedThread({ ...selectedThread, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedThread?.content || ''}
                onChange={(e) => setSelectedThread({ ...selectedThread, content: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditThreadModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditThread}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Reply Modal */}
      <Modal show={showEditReplyModal} onHide={() => setShowEditReplyModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Reply</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedReply?.content || ''}
                onChange={(e) => setSelectedReply({ ...selectedReply, content: e.target.value })}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditReplyModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditReply}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Container>
  );
};

export default AdminDiscussionForum;
