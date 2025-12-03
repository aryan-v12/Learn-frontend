import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, ListGroup, Form, Alert, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    user: {
      name: "",
      email: "",
      role: "",
      points: 0, // Add points to user object
    },
    quizzesCompleted: 0,
    interests: [],
    recentActivity: [],
  });
  const [newInterest, setNewInterest] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDashboardData(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch dashboard data");
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  },[API_BASE_URL]);

  // Add new interest
  const handleAddInterest = async () => {
    if (!newInterest.trim()) {
      toast.error("Please enter a valid interest.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/add-interests`,
        { interests: [...dashboardData.interests, newInterest] },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNewInterest("");
      fetchDashboardData(); // Refresh dashboard data
      toast.success("Interest added successfully!");
    } catch (err) {
      toast.error("Failed to add interest");
    }
  };

  // Delete interest
  const handleDeleteInterest = async (interest) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/add-interests`,
        { interests: dashboardData.interests.filter((item) => item !== interest) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchDashboardData(); // Refresh dashboard data
      toast.success("Interest deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete interest");
    }
  };
     

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ marginBottom: "80px" }}>
      <h2 className="text-center mb-4">Dashboard</h2>

      {/* Welcome Message */}
      <Row className="mb-4">
        <Col>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Welcome Back, {dashboardData.user.name}!</Card.Title>
              <Card.Text>Track your progress and manage your interests here.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Quizzes Completed</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {dashboardData.quizzesCompleted}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Points</Card.Title>
              <Card.Text style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {dashboardData.user.points} {/* Display points from user object */}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Interests Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Your Interests</Card.Title>
              {dashboardData.interests.length > 0 ? (
                <ListGroup>
                  {dashboardData.interests.map((interest, index) => (
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <ul className="list-unstyled">
                {dashboardData.recentActivity.map((activity, index) => (
                  <li key={index} className="mb-2">
                    <strong>{activity.type}:</strong>{" "}
                    {activity.quiz?.title
                      ? `Completed '${activity.quiz.title}' quiz with ${activity.score || 0} points`
                      : "Completed a quiz"}
                    <small className="text-muted d-block">
                      ({new Date(activity.attemptedAt).toLocaleDateString()})
                    </small>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toast Container */}
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
    </Container>
  );
};

export default Dashboard;
