import api from './api';

// List of all protected endpoints
const ENDPOINTS = [
  '/crops',
  '/batches',
  '/transactions',
  '/medical-records',
  '/harvesting'
];

// Test all endpoints with current token
export const testAllEndpoints = async () => {
  const token = localStorage.getItem('token');
  console.log('🔍 Current token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.error('❌ No token found in localStorage. Please log in first.');
    return;
  }

  console.log('🧪 Testing all endpoints...');
  
  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      const response = await api.get(endpoint);
      console.log(`✅ Success: ${endpoint}`, response.data);
    } catch (err) {
      console.error(`🔥 Error at ${endpoint}:`, {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        code: err.response?.data?.code
      });
    }
  }
};

// Test single endpoint
export const testEndpoint = async (endpoint) => {
  const token = localStorage.getItem('token');
  console.log('🔍 Current token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.error('❌ No token found in localStorage. Please log in first.');
    return;
  }

  try {
    console.log(`\n📡 Testing ${endpoint}...`);
    const response = await api.get(endpoint);
    console.log(`✅ Success: ${endpoint}`, response.data);
    return response.data;
  } catch (err) {
    console.error(`🔥 Error at ${endpoint}:`, {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      code: err.response?.data?.code
    });
    throw err;
  }
};

// Debug current auth state
export const debugAuthState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  console.log('🔍 Current Auth State:');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('User:', user ? JSON.parse(user) : 'Not logged in');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', {
        id: payload.id,
        email: payload.email,
        exp: new Date(payload.exp * 1000).toLocaleString()
      });
    } catch (err) {
      console.error('Error parsing token:', err);
    }
  }
};

// Force refresh token by logging in again
export const refreshToken = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('✅ Token refreshed successfully');
    return true;
  } catch (err) {
    console.error('❌ Failed to refresh token:', err);
    return false;
  }
}; 