import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureAuth, checkAuthState } from '../../utils/api';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authState = checkAuthState();
      if (!authState.isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return children;
};

export default ProtectedRoute; 