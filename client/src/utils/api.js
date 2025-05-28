import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${token ? token.trim() : ''}`, // Set token if available
    'Content-Type': 'application/json',
  },
});

// Read token from localStorage on module initialization

if (token) {
  // Ensure token is properly formatted and set default header
  api.defaults.headers.common['Authorization'] = `Bearer ${token.trim()}`;
  console.log('API initialized with token from localStorage', { tokenLength: token.length });
}

// Add request interceptor to add auth token (redundant but kept for safety, the default header should be set)
api.interceptors.request.use(
  (config) => {
    // The default Authorization header should already be set if a token exists
    // This interceptor can log or potentially re-add if somehow missed, but primary logic is outside
    console.log('Request interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!config.headers.Authorization,
      tokenLength: config.headers.Authorization ? config.headers.Authorization.length : 0,
    });
    // Add last activity timestamp for inactivity check
    if (!config.url.includes('/auth')) { // Avoid updating activity on auth routes
       localStorage.setItem("lastActivity", new Date().getTime().toString());
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorData = error.response?.data;
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      code: errorData?.code,
      message: errorData?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized response, clearing token and redirecting to login.');
      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
      
      // Remove default Authorization header
      delete api.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        // Use window.location.href to force full page reload and clear state
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    // Ensure token is properly formatted
    const formattedToken = token.trim();
    localStorage.setItem('token', formattedToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${formattedToken}`;
    console.log('Token set successfully via setAuthToken, length:', formattedToken.length);
    localStorage.setItem("lastActivity", new Date().getTime().toString()); // Set initial activity on login
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    delete api.defaults.headers.common['Authorization'];
    console.log('Token removed via setAuthToken');
  }
};

export default api; 