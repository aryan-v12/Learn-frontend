import React, { useCallback, useEffect, useState } from 'react';
import { Container, Card, Button, Form, Alert, ListGroup, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const DiscussionForum = () => {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState({ content: '', threadId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const [showReplyForm, setShowReplyForm] = useState(null); // Track which thread's reply form is open

  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const fetchThreads = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/threads`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setThreads(response.data);
      setError(''); // Clear any previous errors
    } catch (err) {
      // setError('Error fetching threads');
      toast.error('Error fetching threads'); // Display error toast
    } finally {
      setLoading(false); // Loading complete
    }
  }, [API_BASE_URL]);
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleThreadSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/threads`, newThread, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setThreads([...threads, response.data]);
      setNewThread({ title: '', content: '' });
      // setSuccess('Thread created successfully');
      setError('');
      toast.success('Thread created successfully'); // Display success toast
    } catch (err) {
      setError('Error creating thread');
      setSuccess('');
      toast.error('Error creating thread'); // Display error toast
    }
  };

  const handleReplySubmit = async (e, threadId) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/replies`, // Use the correct endpoint
        { content: newReply.content, threadId }, // Include threadId in the request body
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Fetch updated threads to reflect the new reply
      await fetchThreads();

      setNewReply({ content: '', threadId: '' });
      setShowReplyForm(null); // Close the reply form
      toast.success('Reply added successfully');
    } catch (err) {
      toast.error('Error adding reply');
    }
  };

  return (
    <Container className="mt-4" style={{ marginBottom: '80px' }}>
      <h1>Discussion Forum</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Create Thread Form */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleThreadSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={newThread.title}
                onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter content"
                value={newThread.content}
                onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">Create Thread</Button>
          </Form>
        </Card.Body>
      </Card>

      {/* List of Threads */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : threads.length > 0 ? (
        threads.map((thread) => (
          <Card key={thread._id} className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>{thread.title}</Card.Title>
              <Card.Text>{thread.content}</Card.Text>
              <Button
                variant="info"
                onClick={() => setShowReplyForm(showReplyForm === thread._id ? null : thread._id)}
              >
                {showReplyForm === thread._id ? 'Cancel Reply' : 'Reply'}
              </Button>

              {/* Reply Form (Visible only for the selected thread) */}
              {showReplyForm === thread._id && (
                <Form onSubmit={(e) => handleReplySubmit(e, thread._id)} className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Write a reply..."
                      value={newReply.content}
                      onChange={(e) => setNewReply({ ...newReply, content: e.target.value })}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">Submit Reply</Button>
                </Form>
              )}

              {/* Display Replies */}
              {thread.replies?.length > 0 && (
                <ListGroup className="mt-3">
                  {thread.replies.map((reply) => (
                    <ListGroup.Item key={reply._id}>
                      <Card.Text>{reply.content}</Card.Text>
                      <small className="text-muted">By: {reply.author?.name || 'Unknown'}</small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No threads available.</p>
      )}

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

export default DiscussionForum;
