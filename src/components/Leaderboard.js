import React from 'react';
import { Table } from 'react-bootstrap';

function Leaderboard({ users = [] }) {
  return (
    <div className="mt-4">
      <h2 className="text-center mb-4">Leaderboard</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.points}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default Leaderboard;