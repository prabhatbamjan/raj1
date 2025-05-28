import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
} from '@mui/material';
import { 
  AccountCircle, 
  Notifications, 
  Menu as MenuIcon,
  Grass as CropIcon,
  Cloud as WeatherIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import api from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/notifications');
      console.log("response", response);
      
      // api utility already returns the response with data property
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      // The api utility already handles the token from localStorage
      const response = await api.post(`/notifications/${notificationId}/read`);
      
      // api utility returns response object directly
      if (response.status === 200) {
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // The api utility already handles the token from localStorage
      const response = await api.post('/notifications/read-all');
      
      // api utility returns response object directly
      if (response.status === 200) {
        fetchNotifications(); // Refresh notifications
        handleCloseNotifications();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleCloseNotifications = () => {
    setNotificationAnchorEl(null);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    navigate('/');
  };

  // Don't show navbar on login and signup pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/#features' },
    { label: 'About', path: '/#about' },
    { label: 'Contact', path: '/#contact' },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'crop':
        return <CropIcon sx={{ color: '#388e3c' }} />;
      case 'weather':
        return <WeatherIcon sx={{ color: '#1976d2' }} />;
      case 'inventory':
        return <InventoryIcon sx={{ color: '#d32f2f' }} />;
      default:
        return <Notifications sx={{ color: '#757575' }} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#ffffff',
        color: '#202124',
        boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: { xs: 1, md: 0 },
              color: '#1a73e8',
              fontWeight: 600,
              cursor: 'pointer',
              mr: { md: 4 },
            }}
            onClick={() => navigate(token ? '/dashboard' : '/')}
          >
            Farm Management System
          </Typography>

          {token ? (
            // Post-login navbar
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              <IconButton 
                color="inherit"
                onClick={handleNotificationMenu}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationClose}
                PaperProps={{
                  sx: {
                    width: 360,
                    maxHeight: 400,
                  },
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6">Notifications</Typography>
                  {notifications.length > 0 && (
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
                  )}
                </Box>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No new notifications</Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {notifications.map((notification, index) => (
                      <React.Fragment key={index}>
                        <ListItem 
                          sx={{ 
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                            opacity: notification.read ? 0.7 : 1,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'transparent' }}>
                              {getNotificationIcon(notification.type)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={notification.message}
                            secondary={new Date(notification.date).toLocaleString()}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: notification.read ? 400 : 500,
                            }}
                            secondaryTypographyProps={{
                              variant: 'caption',
                            }}
                          />
                          {!notification.read && (
                            <Button
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
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
                        {index < notifications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Menu>
              <IconButton
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1a73e8' }}>
                  <AccountCircle />
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                  Settings
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); handleLogout(); }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            // Pre-login navbar
            <>
              {isMobile ? (
                <>
                  <IconButton
                    color="inherit"
                    onClick={handleMobileMenu}
                    sx={{ ml: 'auto' }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    anchorEl={mobileMenuAnchor}
                    open={Boolean(mobileMenuAnchor)}
                    onClose={handleMobileMenuClose}
                  >
                    {navItems.map((item) => (
                      <MenuItem 
                        key={item.label}
                        onClick={() => {
                          handleMobileMenuClose();
                          navigate(item.path);
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                    <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/login'); }}>
                      Login
                    </MenuItem>
                    <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/signup'); }}>
                      Sign Up
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexGrow: 1, gap: 2 }}>
                    {navItems.map((item) => (
                      <Button
                        key={item.label}
                        color="inherit"
                        onClick={() => navigate(item.path)}
                        sx={{
                          color: '#5f6368',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      color="inherit" 
                      onClick={() => navigate('/login')}
                      sx={{ 
                        color: '#1a73e8',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/signup')}
                      sx={{ 
                        backgroundColor: '#1a73e8',
                        '&:hover': {
                          backgroundColor: '#1557b0',
                        },
                      }}
                    >
                      Sign Up
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
