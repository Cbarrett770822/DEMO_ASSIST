import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PresentationSettings from './PresentationSettings';
import ProcessManagement from './ProcessManagement';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { selectIsAdmin } from '../../features/auth/authSlice';

const SettingsPage = () => {
  const navigate = useNavigate();
  const isAdmin = useSelector(selectIsAdmin);
  const [activeTab, setActiveTab] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  // Function to show notifications from child components
  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          WMS Settings
        </Typography>
        {isAdmin && (
          <Typography variant="subtitle1" color="primary">
            Admin Mode
          </Typography>
        )}
      </Box>
      
      <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Tab 
            icon={<ListAltIcon />} 
            label="Process Management" 
            id="tab-0" 
            aria-controls="tabpanel-0"
          />
          <Tab 
            icon={<SlideshowIcon />} 
            label="Presentation Links" 
            id="tab-1" 
            aria-controls="tabpanel-1"
          />
        </Tabs>

        <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0" sx={{ p: 0 }}>
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Process & Step Management
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Create and manage warehouse processes and their steps. Add video links to each step for training purposes.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <ProcessManagement showNotification={showNotification} />
            </Box>
          )}
        </Box>

        <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1" sx={{ p: 0 }}>
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Presentation Links
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Manage links to presentations that can be accessed from the Presentations page.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <PresentationSettings showNotification={showNotification} />
            </Box>
          )}
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Note:</strong> All changes are automatically saved to the database and will be available to all users with appropriate permissions.
        </Typography>
      </Alert>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
