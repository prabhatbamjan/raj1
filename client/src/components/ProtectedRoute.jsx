import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Since we removed auth, always render the children
  return children;
};

export default
 ProtectedRoute; 