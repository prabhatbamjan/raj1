const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

module.exports = function(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing'); // Debug log

    if (!authHeader) {
      console.log('No auth header found'); // Debug log
      return res.status(401).json({ 
        message: 'No authorization header',
        code: 'NO_AUTH_HEADER'
      });
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      console.log('Invalid token format'); // Debug log
      return res.status(401).json({ 
        message: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Get token without 'Bearer ' prefix
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.log('Empty token'); // Debug log
      return res.status(401).json({ 
        message: 'Empty token',
        code: 'EMPTY_TOKEN'
      });
    }

    // Log token details (first 10 chars for security)
    console.log('Token details:', {
      length: token.length,
      preview: token.substring(0, 10) + '...'
    });

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for user:', {
      id: decoded.id,
      email: decoded.email,
      exp: new Date(decoded.exp * 1000).toLocaleString()
    });
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
}; 