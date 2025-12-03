import React, { useState, useEffect } from "react";
import { Container, Table, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminLeaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/leaderboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Filter out users with role 'admin'
        const filteredUsers = response.data.filter((user) => user.role !== "admin");

        setUsers(filteredUsers); // Set filtered users
        setLoading(false);
      } catch (err) {
        toast.error("Failed to fetch leaderboard data");
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  const handleReset = async (userId) => {
    // Find the user object from the users array
    const user = users.find((user) => user._id === userId);

    if (window.confirm(`Are you sure you want to reset ${user.name}?`)) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/admin/reset-user/${userId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Update the user in the state
        setUsers(users.map((user) => (user._id === userId ? response.data.user : user)));

        toast.success(`User "${user.name}" reset successfully!`);
      } catch (err) {
        toast.error(`Failed to reset user "${user.name}"`);
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading admin leaderboard...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Admin Leaderboard</h2>

      <Table striped bordered hover responsive style={{ marginBottom: "80px" }}>
        <thead className="bg-dark text-white">
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Total Points</th>
            <th>Completed Quizzes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.points}</td>
              <td>
                <ul className="list-unstyled">
                  {user.completedQuizzes.map((quiz, i) => (
                    <li key={i}>
                      {quiz.quiz?.title || "Deleted Quiz"} - {quiz.score} points
                      <small className="text-muted d-block">
                        ({new Date(quiz.attemptedAt).toLocaleDateString()})
                      </small>
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleReset(user._id)}>
                  Reset User
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

export default AdminLeaderboard;