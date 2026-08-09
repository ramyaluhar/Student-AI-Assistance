// components/ProtectedRoute.jsx
// Guards routes that require authentication (and optionally admin role).

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader full label="Loading your session..." />;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
