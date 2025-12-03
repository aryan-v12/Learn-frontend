import React, { useCallback, useEffect, useState } from 'react';
import { Container, Form, Button, ListGroup, Alert, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import {ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState(null);
  const [isToEveryone, setIsToEveryone] = useState(false);
  const [isToAdmins, setIsToAdmins] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const fetchMessages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/get-messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log(response.data); // Debugging: Log messages
      setMessages(response.data);
    } catch (err) {
      setError('Error fetching messages');
      toast.error('Error fetching messages'); // Display error toast
    }
  },[API_BASE_URL]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Error fetching users');
      toast.error('Error fetching users'); // Display error toast
    }
  },[API_BASE_URL]);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, [fetchMessages,fetchUsers]);



  const handleSendMessage = async () => {
    if (!newMessage || newMessage.trim() === '') {
      // setError('Message cannot be empty');
      setSuccess('');
      toast.error('Message cannot be empty'); // Display error toast
      return;
    }

    if (!isToEveryone && !isToAdmins && !receiverId) {
      // setError('Please select a recipient or choose "To Everyone" or "To Admins"');
      setSuccess('');
      toast.error('Please select a recipient or choose "To Everyone" or "To Admins"'); // Display error toast
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/send-message`,
        {
          message: newMessage,
          receiverId,
          isToEveryone,
          isToAdmins,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessages([...messages, response.data.chat]);
      setNewMessage('');
      // setSuccess('Message sent successfully');
      setError('');
      toast.success('Message sent successfully'); // Display success toast
    } catch (err) {
      // setError('Error sending message');
      setSuccess('');
      toast.error('Error sending message'); // Display error toast
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/delete-message/${messageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessages(messages.filter((message) => message._id !== messageId));
      // setSuccess('Message deleted successfully');
      setError('');
      toast.success('Message deleted successfully'); // Display success toast
    } catch (err) {
      // setError('Error deleting message');
      setSuccess('');
      toast.error('Error deleting message'); // Display error toast
    }
  };

  return (
    <Container className="mt-4" style={{ marginBottom: '80px' }}>
      <h2>Chat</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="To Everyone"
            checked={isToEveryone}
            onChange={(e) => setIsToEveryone(e.target.checked)}
          />
          <Form.Check
            type="checkbox"
            label="To Admins"
            checked={isToAdmins}
            onChange={(e) => setIsToAdmins(e.target.checked)}
          />
        </Form.Group>
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* User Selection Dropdown */}
          <Dropdown>
            <Dropdown.Toggle variant="info" id="dropdown-basic">
              {receiverId ? users.find((user) => user._id === receiverId)?.name : 'Select User'}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {users.map((user) => (
                <Dropdown.Item
                  key={user._id}
                  onClick={() => {
                    setReceiverId(user._id);
                    toast.info(`Selected user: ${user.name}`); // Display info toast
                  }}
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    fontWeight: user.role === 'admin' ? 'bold' : 'normal', // Bold for admin
                    color: user.role === 'admin' ? '#black' : 'inherit', // Blue color for admin
                  }}
                >
                  {/* User Name */}
                  <span>{user.name}</span>

                  {/* (Admin) Label, only for admins */}
                  {user.role === 'admin' && <span className="text-muted" style={{ fontSize: '0.9em' }}>(Admin)</span>}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Send Message Button */}
          <Button variant="success" onClick={handleSendMessage}>
            Send Message
          </Button>
        </div>
      </Form>

      <ListGroup className="mt-4">
        {messages.map((message) => (
          <ListGroup.Item
            key={message._id}
            className="d-flex justify-content-between align-items-center"
            style={{
              backgroundColor: message.sender.role === 'admin' ? '#f5f5f5' : '#ffffff', // Light Gray for Admin, White for Users
              borderRadius: '8px',
              marginBottom: '10px',
              padding: '12px 16px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
              border: '1px solid #ddd',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = message.sender.role === 'admin' ? '#ebebeb' : '#f8f8f8'; // Slightly Darker Gray for Admin on Hover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = message.sender.role === 'admin' ? '#f5f5f5' : '#ffffff';
            }}
          >
            {/* Message Content */}
            <div style={{ flex: 1, marginRight: '10px' }}>
              <strong
                style={{
                  fontWeight: message.sender.role === 'admin' ? 'bold' : 'normal', // Only Admin Bold
                  textTransform: message.sender.role === 'admin' ? 'uppercase' : 'capitalize', // Admin = UPPERCASE, User = Normal
                  color: 'black',
                  fontSize: '16px',
                  lineHeight: '1.5',
                }}
              >
                {message.sender.name}:
              </strong>{' '}
              <span
                style={{
                  color: '#333',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                {message.message}
              </span>
            </div>

            {/* Delete Button */}
            {(localStorage.getItem('role') === 'admin' || message.sender._id === localStorage.getItem('userId')) && (
              <Button
                size="sm"
                onClick={() => handleDeleteMessage(message._id)}
                style={{
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  backgroundColor: '#6c757d', // Default Grey Color
                  borderColor: '#6c757d',
                  color: 'white',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc3545'; // Hover: Red
                  e.target.style.borderColor = '#dc3545';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d'; // Back to Grey
                  e.target.style.borderColor = '#6c757d';
                }}
              >
                🗑 Delete
              </Button>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

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

export default ChatPage;