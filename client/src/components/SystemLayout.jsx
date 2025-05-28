import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const drawerWidth = 280;
const navbarHeight = 64;

const SystemLayout = ({ children, title, breadcrumbs = [], actions }) => {
  return (
    // Removed display: 'flex' to avoid extra white space caused by fixed Sidebar
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      {/* Fixed Navbar at top */}
      <Box sx={{ position: 'fixed', width: '100%', zIndex: 1201 }}>
        <Navbar />
      </Box>

      {/* Fixed Sidebar */}
      <Box
        sx={{
          width: `${drawerWidth}px`,
          position: 'fixed',
          top: `${navbarHeight}px`,
          bottom: 0,
          left: 0,
          zIndex: 1200,
          backgroundColor: '#fff',
          borderRight: '1px solid #ddd',
          overflowY: 'auto', // Optional: scroll if sidebar content exceeds viewport
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          ml: `${drawerWidth}px`, // Push content right of sidebar
          mt: `${navbarHeight}px`, // Push content below navbar
          p: 2, // Reduced padding from 3 to 2
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: `calc(100vh - ${navbarHeight}px)`,
          maxWidth: '1200px' // Add maximum width to prevent excessive stretching
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>

          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            {breadcrumbs.map((crumb, index) =>
              index === breadcrumbs.length - 1 ? (
                <Typography key={index} color="text.primary">
                  {crumb.text}
                </Typography>
              ) : (
                <Link
                  key={index}
                  component={RouterLink}
                  to={crumb.path}
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {crumb.text}
                </Link>
              )
            )}
          </Breadcrumbs>

          {/* Optional Actions */}
          {actions && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              {actions}
            </Box>
          )}
        </Box>

        {/* Actual Page Content */}
        <Box>{children}</Box>
      </Box>
    </Box>
  );
};

export default SystemLayout;
