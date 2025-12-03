import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Form } from 'react-bootstrap';
import Quiz from '../components/Quiz';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topicId, setTopicId] = useState('');

  const userId = localStorage.getItem('userId'); // Get the current user's ID
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  // ✅ Fetch Topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/topics`);
        if (!response.ok) throw new Error('Failed to fetch topics');
        const data = await response.json();
        setTopics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(err.message);
        toast.error('Failed to fetch topics'); // Display error toast
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [API_BASE_URL]);

  // ✅ Fetch Quizzes when topicId changes
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!topicId) {
        setQuizzes([]); // Clear quizzes if no topic is selected
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/quizzes/topic/${topicId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
        setError(null);
        toast.success('Quizzes fetched successfully'); // Display success toast
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message);
        toast.error('Failed to fetch quizzes'); // Display error toast
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [topicId,API_BASE_URL]);

  return (
    <Container className="mt-4" style={{ marginBottom: '80px' }}>
      <h2 className="text-center mb-4">Quizzes</h2>

      {/* Topic Selection Dropdown */}
      <Form.Group className="mb-4">
        <Form.Label>Select Topic</Form.Label>
        <Form.Control
          as="select"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          disabled={loading} // Disable dropdown while loading
        >
          <option value="">Select a topic</option>
          {topics.map((topic) => (
            <option key={topic._id} value={topic._id}>
              {topic.title}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Loading Spinner */}
      {loading && (
        <Spinner animation="border" role="status" className="d-block mx-auto">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Quizzes List */}
      {!loading && !error && (
        <>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => <Quiz key={quiz._id} quiz={quiz} userId={userId} />)
          ) : (
            <Alert variant="info">No quizzes found for this topic.</Alert>
          )}
        </>
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
}

export default QuizPage;