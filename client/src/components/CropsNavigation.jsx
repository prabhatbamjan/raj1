import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Divider,
  IconButton,
  Typography
} from '@mui/material';
import {
  LocalFlorist as CropIcon,
  MedicalServices as MedicalIcon,
  Agriculture as HarvestIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import CropForm from './CropForm';
import MedicalRecordsForm from './MedicalRecordsForm';
import HarvestingRecordsForm from './HarvestingRecordsForm';
import Analytics from './Analytics';
import SystemLayout from './SystemLayout';

const CropsNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect directly to CropForm when the Crops page is loaded
    if (location.pathname === '/crops') {
      navigate('/crops/form');
    }
  }, [location.pathname, navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    {
      text: 'Crop Form',
      icon: <CropIcon />,
      path: '/crops/form',
      component: CropForm
    },
    {
      text: 'Medical Records',
      icon: <MedicalIcon />,
      path: '/crops/medical-records',
      component: MedicalRecordsForm
    },
    {
      text: 'Harvesting Records',
      icon: <HarvestIcon />,
      path: '/crops/harvesting-records',
      component: HarvestingRecordsForm
    }
  ];

  const handleTabChange = (event, newValue) => {
    navigate(newValue);
  };

  const getCurrentTabValue = () => {
    const currentPath = location.pathname;
    const matchingItem = menuItems.find(item => item.path === currentPath);
    return matchingItem ? matchingItem.path : menuItems[0].path;
  };

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
        <CropIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />
        <Box>
          <Box sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
            Crops Management
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
      title="Crops Management"
      breadcrumbs={[
        { text: 'Home', path: '/' },
        { text: 'Crops' }
      ]}
      actions={
        <Typography
          variant="button"
          color="primary"
          sx={{
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            }
          }}
          onClick={() => navigate("/crop-analytics")} // Redirect to Crop Analytics page
        >
          Analytics {/* Changed from AnalyticsIcon to "Analytics" text */}
        </Typography>
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
            value={getCurrentTabValue()}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48,
                px: 3,
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          >
            {menuItems.map((item) => (
              <Tab
                key={item.text}
                label={item.text}
                value={item.path}
                icon={item.icon}
                iconPosition="start"
                component={Link}
                to={item.path}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <Routes>
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

export default CropsNavigation;
