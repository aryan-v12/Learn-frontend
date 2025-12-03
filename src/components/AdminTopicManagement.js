import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminTopicManagement = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editTopic, setEditTopic] = useState(null); // Editing mode flag
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  // ✅ Fetch all topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/topics`);
        if (!response.ok) throw new Error('Failed to fetch topics');
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        setError('Error fetching topics');
        toast.error('Error fetching topics'); // Display error toast
      }
    };
    fetchTopics();
  }, [API_BASE_URL]);

  // ✅ Add / Update Topic
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editTopic
        ? `${API_BASE_URL}/api/edit-topic/${editTopic._id}`
        : `${API_BASE_URL}/api/add-topic`;

      const method = editTopic ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) throw new Error('Failed to save topic');

      const data = await response.json();

      if (editTopic) {
        setTopics(topics.map((t) => (t._id === editTopic._id ? data.topic : t)));
        // setSuccess('Topic updated successfully!');
        toast.success('Topic updated successfully!'); // Display success toast
      } else {
        setTopics([...topics, data.topic]);
        // setSuccess('Topic added successfully!');
        toast.success('Topic added successfully!'); // Display success toast
      }

      setError('');
      setTitle('');
      setDescription('');
      setEditTopic(null); // Reset edit mode
    } catch (err) {
      // setError(err.message);
      setSuccess('');
      toast.error(err.message); // Display error toast
    }
  };

  // ✅ Delete Topic
  const handleDeleteTopic = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/delete-topic/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete topic');

      setTopics(topics.filter((topic) => topic._id !== id));
      // setSuccess('Topic deleted successfully!');
      setError('');
      toast.success('Topic deleted successfully!'); // Display success toast
    } catch (err) {
      // setError(err.message);
      setSuccess('');
      toast.error(err.message); // Display error toast
    }
  };

  // ✅ Edit Topic - Data fill in form
  const handleEditTopic = (topic) => {
    setEditTopic(topic);
    setTitle(topic.title);
    setDescription(topic.description);
    toast.info(`Editing topic: ${topic.title}`); // Display info toast
  };

  // ✅ Redirect to Create Quiz page
  const handleCreateQuiz = (topicId) => {
    toast.info('Redirecting to Create Quiz page...', {
      autoClose: 2000, // Toast will close after 2 seconds
      onClose: () => {
        // Redirect to Create Quiz page after the toast closes
        navigate(`/admin/quizzes?topicId=${topicId}`);
      },
    });
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Manage Topics</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* ✅ Add / Update Topic Form */}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Topic Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter topic title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Topic Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter topic description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant={editTopic ? 'success' : 'primary'} type="submit">
          {editTopic ? 'Update Topic' : 'Add Topic'}
        </Button>
        {editTopic && (
          <Button
            variant="secondary"
            className="ms-2"
            onClick={() => {
              setEditTopic(null);
              setTitle('');
              setDescription('');
              toast.info('Edit mode cancelled'); // Display info toast
            }}
          >
            Cancel
          </Button>
        )}
      </Form>

      {/* ✅ Topics List */}
      <Table striped bordered hover responsive style={{ marginBottom: '80px' }}>
        <thead>
          <tr>
            <th style={{ width: '25%' }}>Title</th>
            <th style={{ width: '45%' }}>Description</th>
            <th style={{ width: '30%', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((topic) => (
            <tr key={topic._id}>
              <td>{topic.title}</td>
              <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{topic.description}</td>
              <td className="text-center">
                <Button variant="warning" onClick={() => handleEditTopic(topic)} className="me-2">
                  Edit
                </Button>
                <Button variant="info" onClick={() => handleCreateQuiz(topic._id)} className="me-2">
                  Create Quiz
                </Button>
                <Button variant="danger" onClick={() => handleDeleteTopic(topic._id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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

export default AdminTopicManagement;