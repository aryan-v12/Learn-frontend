import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Check if the logged-in user is an admin
  useEffect(() => {
    const userRole = localStorage.getItem('role');
    if (userRole !== 'admin') {
      navigate('/not-allowed');
    }
  }, [navigate]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [API_BASE_URL]);

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setUsers(users.filter((user) => user._id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Error deleting user');
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      toast.error('Please enter a valid password');
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/api/users/${selectedUser._id}/reset-password`,
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      toast.success('Password reset successfully');
      setShowResetModal(false);
      setNewPassword('');
    } catch (err) {
      toast.error('Error resetting password');
    }
  };
  // Update user role
  const handleUpdateRole = async () => {
    if (!newRole) {
      toast.error('Please select a role');
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/api/users/${selectedUser._id}/update-role`,
        { newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setUsers(users.map((user) =>
        user._id === selectedUser._id ? { ...user, role: newRole } : user
      ));
      toast.success('Role updated successfully');
      setShowRoleModal(false);
    } catch (err) {
      toast.error('Error updating role');
    }
  };

  // If the user is not an admin, show a "Not Allowed" message
  if (localStorage.getItem('role') !== 'admin') {
    return (
      <Container className="mt-4 text-center">
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ marginBottom: '80px' }}>
      <h2 className="text-center mb-4">Admin Dashboard</h2>

      {/* ToastContainer for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Interests</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td style={{ wordWrap: 'break-word', maxWidth: '200px' }}>
                    {user.interests && user.interests.length > 0 ? (
                      <ul>
                        {user.interests.map((interest, index) => (
                          <li key={index}>{interest}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>No interests added</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-wrap" style={{ justifyContent: "space-evenly" }}>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteUser(user._id)}
                        className="mb-2"
                        style={{
                          minWidth: '120px', // Uniform Button Width
                        }}
                      >
                        🗑 Delete
                      </Button>

                      <Button
                        variant="warning"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowResetModal(true);
                        }}
                        className="mb-2"
                        style={{
                          minWidth: '140px',
                        }}
                      >
                        🔑 Reset Password
                      </Button>

                      <Button
                        variant="info"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setShowRoleModal(true);
                        }}
                        className="mb-2"
                        style={{
                          minWidth: '130px',
                        }}
                      >
                        🔄 Update Role
                      </Button>
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Reset Password Modal */}
          <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Reset Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowResetModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleResetPassword}>
                Reset Password
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Update Role Modal */}
          <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Update Role</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Role</Form.Label>
                  <Form.Control
                    as="select"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Control>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleUpdateRole}>
                Update Role
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
