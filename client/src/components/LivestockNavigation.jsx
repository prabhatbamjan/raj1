import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Pets as LivestockIcon,
  MedicalServices as MedicalIcon,
  Agriculture as HarvestIcon,
  Menu as MenuIcon,
  Favorite as BreedingIcon
} from '@mui/icons-material';
import LivestockBatches from './LivestockBatches';
import LivestockRecords from './LivestockRecords';
import LivestockMedicalRecords from './LivestockMedicalRecords';
import LivestockBreeding from './LivestockBreeding';
import SystemLayout from './SystemLayout';

const LivestockNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-redirect to livestock batches if on the parent path
  useEffect(() => {
    if (location.pathname === '/livestocks') {
      navigate('/livestocks/batches');
    }
  }, [location.pathname, navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Get the current tab value based on the current path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/livestocks/batches')) return '/livestocks/batches';
    if (path.includes('/livestocks/records')) return '/livestocks/records';
    if (path.includes('/livestocks/medical-records')) return '/livestocks/medical-records';
    if (path.includes('/livestocks/breeding')) return '/livestocks/breeding';
    return '/livestocks/batches'; // Default tab
  };

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const menuItems = [
    {
      text: 'Batches',
      icon: <LivestockIcon />,
      path: '/livestocks/batches',
      component: LivestockBatches
    },
    {
      text: 'Records',
      icon: <HarvestIcon />,
      path: '/livestocks/records',
      component: LivestockRecords
    },
    {
      text: 'Medical Records',
      icon: <MedicalIcon />,
      path: '/livestocks/medical-records',
      component: LivestockMedicalRecords
    },
    {
      text: 'Breeding',
      icon: <BreedingIcon />,
      path: '/livestocks/breeding',
      component: LivestockBreeding
    }
  ];

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 1
      }}>
        <LivestockIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
        <Box>
          <Box sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
            Livestock Management
          </Box>
          <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
            System Dashboard
          </Box>
        </Box>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItem
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                py: 1.5,
                px: 2,
                color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                backgroundColor: location.pathname === item.path ? `${theme.palette.primary.main}10` : 'transparent',
                '&:hover': {
                  backgroundColor: location.pathname === item.path ? `${theme.palette.primary.main}20` : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
            </ListItem>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <SystemLayout
      title="Livestock Management"
      breadcrumbs={[
        { text: 'Home', path: '/' },
        { text: 'Livestock' }
      ]}
      actions={
        <IconButton
          color="primary"
          onClick={() => {/* Handle add new livestock */}}
          sx={{
            backgroundColor: `${theme.palette.primary.main}10`,
            '&:hover': {
              backgroundColor: `${theme.palette.primary.main}20`,
            },
          }}
        >
          <AddIcon />
        </IconButton>
      }
    >
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 280,
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            {drawer}
          </Drawer>
        </>
      ) : (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={getCurrentTab()} 
            onChange={handleTabChange}
            aria-label="livestock navigation tabs"
          >
            <Tab 
              label="Batches" 
              value="/livestocks/batches"
            />
            <Tab 
              label="Records" 
              value="/livestocks/records"
            />
            <Tab 
              label="Medical Records" 
              value="/livestocks/medical-records"
            />
            <Tab 
              label="Breeding" 
              value="/livestocks/breeding"
            />
          </Tabs>
        </Box>
      )}

      <Routes>
        <Route path="/" element={<Navigate to="/livestocks/batches" replace />} />
        {menuItems.map((item) => (
          <Route
            key={item.path}
            path={item.path.split('/').pop()}
            element={<item.component />}
          />
        ))}
      </Routes>
    </SystemLayout>
  );
};

export default LivestockNavigation;