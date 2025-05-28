import React from 'react';
import { Box, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import SystemLayout from '../components/SystemLayout';
import ProfileSettings from '../components/settings/ProfileSettings';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <SystemLayout
      title="Edit Profile"
      breadcrumbs={[
        { text: 'Home', path: '/' },
        { text: 'Profile', path: '/profile' },
        { text: 'Edit Profile' }
      ]}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/profile')}
          sx={{ mb: 3 }}
        >
          Back to Profile
        </Button>
        <ProfileSettings />
      </Box>
    </SystemLayout>
  );
};

export default SettingsPage; 