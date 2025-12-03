import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import Leaderboard from '../components/Leaderboard';

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/leaderboard`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Leaderboard Data:', data);
  
        // Filter out users with role 'admin'
        const filteredLeaderboard = data.filter(user => user.role !== 'admin');
  
        setLeaderboard(filteredLeaderboard);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading leaderboard...</p>
      </Container>
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
    <Container className="mt-4" style={{marginBottom:"80px"}}>
      {leaderboard.length > 0 ? (
        <Leaderboard users={leaderboard} />
      ) : (
        <Alert variant="info">No leaderboard data found.</Alert>
      )}
    </Container>
  );
}

export default LeaderboardPage;