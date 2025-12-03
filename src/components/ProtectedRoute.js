// ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check karo local storage mein token hai ya nahi
  const isAuthenticated = localStorage.getItem('token'); // Assuming token is stored in localStorage

  // Agar token nahi hai, toh homepage par redirect karo
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Agar token hai, toh requested page render karo
  return <Outlet />;
};

export default ProtectedRoute;