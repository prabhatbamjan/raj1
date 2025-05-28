import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Divider,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Grass as CropIcon,
  Pets as LivestockIcon,
  AttachMoney as FinanceIcon,
  Cloud as WeatherIcon,
  Inventory as InventoryIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Crops', icon: <CropIcon />, path: '/crops' },
  { text: 'Livestock', icon: <LivestockIcon />, path: '/livestocks' },
  { text: 'Finance', icon: <FinanceIcon />, path: '/finance' },
  { text: 'Weather', icon: <WeatherIcon />, path: '/weather' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
];

const bottomMenuItems = [
  { text: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // If no user is logged in or on login/signup pages, don't show the sidebar
  if (!user || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  // Adjusted isActive function with logging
  const isActive = (path) => {
    // console.log(`Checking path: ${path}, current location: ${location.pathname}`);
    if (path === '/') return location.pathname === '/' || location.pathname === '/dashboard';
    
    // Handle exact match for dashboard
    if (path === '/dashboard') return location.pathname === '/dashboard';

    // For other paths, check if the current location starts with the item path
    // and is not just the dashboard (to prevent dashboard highlighting everything)
    if (location.pathname.startsWith(path) && location.pathname !== '/dashboard') {
       return true;
    }

    // Special handling for root path if it's not redirecting
     if (path === '/' && (location.pathname === '/' || location.pathname === '')) {
       return true;
     }

    return false; // Default to not active
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: '#ffffff',
          position: 'fixed',
          height: '100vh',
          top: 64, // Height of the navbar
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 0 }}>
        {/* User Profile Section */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#1a73e8' }}>
            <ProfileIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user.name || 'Farm Manager'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.role || 'Administrator'}
            </Typography>
          </Box>
        </Box>
        <Divider />

        {/* Main Navigation */}
        <List>
          {mainMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ 
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                    '& .MuiTypography-root': {
                      fontWeight: isActive(item.path) ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {/* Bottom Navigation */}
        <List>
          {bottomMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{ 
                    color: isActive(item.path) ? 'primary.main' : 'inherit',
                    '& .MuiTypography-root': {
                      fontWeight: isActive(item.path) ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 