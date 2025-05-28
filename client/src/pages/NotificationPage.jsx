import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Button
} from '@mui/material';
import GrassIcon from '@mui/icons-material/Grass';
import CloudIcon from '@mui/icons-material/Cloud';
import InventoryIcon from '@mui/icons-material/Inventory';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import api from '../utils/api';
const iconMap = {
  crop: <GrassIcon sx={{ color: '#388e3c' }} />,
  weather: <CloudIcon sx={{ color: '#1976d2' }} />,
  inventory: <InventoryIcon sx={{ color: '#d32f2f' }} />,
};

const colorMap = {
  crop: '#e8f5e9',
  weather: '#e3f2fd',
  inventory: '#ffebee',
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await api.get('/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to view notifications');
        }
        throw new Error('Failed to fetch notifications');
      }

      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.post(`/notifications/${notificationId}/read`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to mark notification as read');
      fetchNotifications(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/notifications/read-all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to mark all notifications as read');
      fetchNotifications(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 5, p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, color: '#2E3B55' }}>
        <NotificationsActiveIcon sx={{ mr: 1, color: '#1976d2', fontSize: 36 }} />
        Notifications
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Stay updated with important alerts about your crops, inventory, and weather.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
          {error.includes('log in') && (
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.href = '/login'}
              sx={{ ml: 2 }}
            >
              Go to Login
            </Button>
          )}
        </Alert>
      ) : notifications.length === 0 ? (
        <Alert severity="info">No notifications at the moment. Everything looks good!</Alert>
      ) : (
        <Paper elevation={2} sx={{ borderRadius: 3, p: 0 }}>
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6">All Notifications</Typography>
            <Button 
              size="small" 
              onClick={handleMarkAllAsRead}
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              }}
            >
              Mark all as read
            </Button>
          </Box>
          <List>
            {notifications.map((notif, idx) => (
              <ListItem
                key={idx}
                sx={{
                  background: colorMap[notif.type] || '#f5f5f5',
                  mb: 1,
                  borderRadius: 2,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  opacity: notif.read ? 0.7 : 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'white', boxShadow: 1 }}>
                    {iconMap[notif.type] || <NotificationsActiveIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notif.message}
                  secondary={notif.date ? new Date(notif.date).toLocaleString() : ''}
                  primaryTypographyProps={{ 
                    fontWeight: notif.read ? 400 : 500,
                    fontSize: 16 
                  }}
                />
                {!notif.read && (
                  <Button
                    size="small"
                    onClick={() => handleMarkAsRead(notif.id)}
                    sx={{ 
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    Mark as read
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationPage; 