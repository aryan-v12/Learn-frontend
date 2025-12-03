import React, { useCallback, useEffect, useState } from 'react';
import { Container, Alert, Form, Button, ListGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState('');
  const [newInterest, setNewInterest] = useState(''); // New interest input ke liye
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Profile data fetch kare
  const fetchProfileData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Token nahi hai toh login page par redirect karo
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setProfileData(data);
      } else {
        setError(data.message || 'Failed to fetch profile data');
        toast.error(data.message || 'Failed to fetch profile data'); // Display error toast
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.'); // Display error toast
    } finally {
      setLoading(false); // Loading complete
    }
  }, [API_BASE_URL, navigate]); // Add `navigate` to the dependency array

  // New interest add kare
  const handleAddInterest = async () => {
    if (!newInterest.trim()) {
      toast.error('Please enter a valid interest.'); // Display error toast
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const updatedInterests = profileData.interests ? [...profileData.interests, newInterest] : [newInterest];
      const response = await fetch(`${API_BASE_URL}/api/add-interests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests: updatedInterests }),
      });
      const data = await response.json();
      if (response.ok) {
        setProfileData(data.user); // Profile data update karo
        setNewInterest(''); // Input box khali karo
        setError('');
        toast.success('Interest added successfully!'); // Display success toast
      } else {
        setError(data.message || 'Failed to add interest');
        toast.error(data.message || 'Failed to add interest'); // Display error toast
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.'); // Display error toast
    }
  };

  // Interest delete kare
  const handleDeleteInterest = async (interestToDelete) => {
    const token = localStorage.getItem('token');
    try {
      const updatedInterests = profileData.interests.filter((interest) => interest !== interestToDelete);
      const response = await fetch(`${API_BASE_URL}/api/add-interests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests: updatedInterests }),
      });
      const data = await response.json();
      if (response.ok) {
        setProfileData(data.user); // Profile data update karo
        setError('');
        toast.success('Interest deleted successfully!'); // Display success toast
      } else {
        setError(data.message || 'Failed to delete interest');
        toast.error(data.message || 'Failed to delete interest'); // Display error toast
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.'); // Display error toast
    }
  };

  // Component mount hone par data fetch kare
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return (
    <Container className="mt-4" style={{ marginBottom: '80px' }}>
      <h2>Profile</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : profileData ? (
        <div>
          <h3>Welcome, {profileData.name}!</h3>
          <p>Email: {profileData.email}</p>

          {/* Interests list */}
          <h4>Your Interests:</h4>
          {profileData.interests && profileData.interests.length > 0 ? (
            <ListGroup>
              {profileData.interests.map((interest, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  {interest}
                  <Button variant="danger" size="sm" onClick={() => handleDeleteInterest(interest)}>
                    Delete
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No interests added yet.</p>
          )}

          {/* Add interest ka form */}
          <Form className="mt-4">
            <Form.Group className="mb-3">
              <Form.Label>Add New Interest</Form.Label>
              <Form.Control
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Enter a new interest (e.g., Mathematics)"
              />
            </Form.Group>
            <Button variant="primary" onClick={handleAddInterest}>
              Add Interest
            </Button>
          </Form>
        </div>
      ) : (
        <p>No profile data found.</p>
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

export default Profile;