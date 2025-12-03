import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, ListGroup, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

const AdminQuizCreation = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '' },
  ]);
  const [topics, setTopics] = useState([]);
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuizId, setEditQuizId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL;



  // Inside your component
  const handleExcelFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Extract the quiz title and description from the first row
      const [headerRow, ...questionRows] = json;

      // Ensure the Excel file has the correct format
      if (
        headerRow[0] !== 'Quiz Title' ||
        headerRow[1] !== 'Quiz Description' ||
        headerRow[2] !== 'Question Text' ||
        headerRow[3] !== 'Option 1' ||
        headerRow[4] !== 'Option 2' ||
        headerRow[5] !== 'Option 3' ||
        headerRow[6] !== 'Option 4' ||
        headerRow[7] !== 'Correct Answer'
      ) {
        toast.error('Invalid Excel format. Please use the correct template.');
        return;
      }

      // Extract the quiz title and description from the second row
      const [title, description] = questionRows[0];

      // Extract questions from the remaining rows
      const questions = questionRows.slice(1).map((row) => ({
        questionText: row[2], // Question Text
        options: [row[3], row[4], row[5], row[6]], // Options 1 to 4
        correctAnswer: row[7], // Correct Answer
      }));

      // Update state
      setTitle(title);
      setDescription(description);
      setQuestions(questions);
      toast.success('Quiz imported from Excel successfully!');
    };

    reader.readAsArrayBuffer(file);
  };


  // Fetch topics and users on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/topics`);
        if (!response.ok) throw new Error('Failed to fetch topics');
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        toast.error('Error fetching topics');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
    fetchUsers();
  }, [API_BASE_URL]);

  // Fetch existing quizzes when topicId changes
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!topicId) {
        setExistingQuizzes([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/quizzes/topic/${topicId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch quizzes');
        }
        const data = await response.json();
        setExistingQuizzes(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [topicId, API_BASE_URL]);

  // Handle question text change
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].questionText = value;
    setQuestions(updatedQuestions);
  };

  // Handle option change
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  // Handle correct answer change
  const handleCorrectAnswerChange = (questionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correctAnswer = value;
    setQuestions(updatedQuestions);
  };

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    toast.success('New question added!');
  };

  // Remove a question
  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    toast.success('Question removed successfully!');
  };

  // Handle user selection
  const handleUserSelection = (userId) => {
    // Find the user object from the users array
    const user = users.find((user) => user._id === userId);

    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      toast.success(`User "${user.name}" removed from allowed list!`); // Include user's name
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      toast.success(`User "${user.name}" added to allowed list!`); // Include user's name
    }
  };

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    setTopicId('');
    setIsEditing(false);
    setEditQuizId(null);
    setSelectedUsers([]);
    // toast.success('Form reset successfully!');
  };

  // Reset allowed users
  const resetAllowedUsers = () => {
    setSelectedUsers([]);
    toast.success('Allowed users reset successfully!');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quizData = {
        title,
        description,
        questions,
        topicId,
        allowedUsers: selectedUsers,
      };

      let response;
      if (isEditing) {
        response = await fetch(`${API_BASE_URL}/api/quizzes/${editQuizId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quizData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/add-quiz`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quizData),
        });
      }

      if (!response.ok) throw new Error('Failed to save quiz');

      toast.success(isEditing ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      resetForm();
      // setTimeout(() => navigate('/admin-dashboard'), 2000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle edit quiz
  const handleEditQuiz = (quiz) => {
    setTitle(quiz.title);
    setDescription(quiz.description);
    setQuestions(quiz.questions);
    setTopicId(quiz.topicId);
    setIsEditing(true);
    setEditQuizId(quiz._id);
    setSelectedUsers(quiz.allowedUsers || []);
    toast.success('Quiz loaded for editing!');
  };

  // Handle delete quiz
  const handleDeleteQuiz = async (quizId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete quiz');
      setExistingQuizzes(existingQuizzes.filter((q) => q._id !== quizId));
      toast.success('Quiz deleted successfully!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Filter out users who are already in the allowedUsers list
  const filteredUsers = users.filter((user) => !selectedUsers.includes(user._id));

  return (
    <Container className="mt-4" style={{ marginBottom: '80px' }}>
      <h2 className="text-center mb-4">Create Quiz</h2>

      {/* Loading Spinner */}
      {loading && (
        <Spinner animation="border" role="status" className="d-block mx-auto">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
      {/* // In the return statement, add the file input and button */}
      <Form.Group className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <Button variant="info" onClick={() => document.getElementById('excelFileInput').click()}>
            📂 Insert From Excel
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open('/utils/quizCreationSample.xlsx', '_blank')}
          >
            ⬇️ Download Excel Sample
          </Button>
        </div>
        <Form.Control
          type="file"
          accept=".xlsx, .xls"
          onChange={handleExcelFileUpload}
          style={{ display: 'none' }}
          id="excelFileInput"
        />
      </Form.Group>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Quiz Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter quiz title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Quiz Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter quiz description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Select Topic</Form.Label>
          <Form.Control
            as="select"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            required
          >
            <option value="">Select a topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.title}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        {/* Existing Quizzes */}
        {existingQuizzes.length > 0 && (
          <div className="mb-4">
            <h4>Existing Quizzes</h4>
            {existingQuizzes.map((quiz) => (
              <Card key={quiz._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>{quiz.title}</Card.Title>
                  <Card.Text>{quiz.description}</Card.Text>
                  <div className="d-flex justify-content-between mb-3">
                    <Button variant="warning" onClick={() => handleEditQuiz(quiz)} className="me-2">
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteQuiz(quiz._id)}>
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {/* New Questions */}
        {questions.map((question, questionIndex) => (
          <Card key={questionIndex} className="mb-4 shadow-sm" style={{ padding: '20px' }}>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Question {questionIndex + 1}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter question"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                  required
                />
              </Form.Group>
              {question.options.map((option, optionIndex) => (
                <Form.Group key={optionIndex} className="mb-3">
                  <Form.Label>Option {optionIndex + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={`Enter option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(questionIndex, optionIndex, e.target.value)
                    }
                    required
                  />
                </Form.Group>
              ))}
              <Form.Group className="mb-3">
                <Form.Label>Correct Answer</Form.Label>
                <Form.Control
                  as="select"
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(questionIndex, e.target.value)}
                  required
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button
                variant="danger"
                onClick={() => removeQuestion(questionIndex)}
                className="mb-3"
              >
                Remove Question
              </Button>
            </Card.Body>
          </Card>
        ))}
        <div className="d-flex justify-content-center gap-3 mb-3">
          <Button variant="secondary" onClick={addQuestion}>Add Question</Button>
          <Button variant="warning" onClick={resetAllowedUsers}>Reset Allowed Users</Button>
          <Button variant="primary" type="submit">
            {isEditing ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </div>

        {/* User Selection */}
        <Form.Group className="mb-3">
          <Form.Label>Select Allowed Users</Form.Label>
          <ListGroup>
            {filteredUsers.map((user) => (
              <ListGroup.Item key={user._id}>
                <Form.Check
                  type="checkbox"
                  label={user.name}
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserSelection(user._id)}
                />
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Form.Group>
      </Form>

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

export default AdminQuizCreation;
