import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

/**
 * UserDebugger Component
 * 
 * A debugging tool that displays information about the current user,
 * localStorage data, and settings persistence.
 */
const UserDebugger = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [localStorageData, setLocalStorageData] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    refreshLocalStorageData();
  }, [refreshKey]);

  const refreshLocalStorageData = () => {
    const data = {};
    
    // Get all localStorage keys that start with 'wms_'
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('wms_')) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : null;
        } catch (error) {
          data[key] = {
            error: 'Could not parse JSON',
            rawValue: localStorage.getItem(key)
          };
        }
      }
    }
    
    setLocalStorageData(data);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatJson = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">User & Settings Debugger</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleRefresh}
        >
          Refresh Data
        </Button>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="h6" gutterBottom>Current Redux User State</Typography>
      {currentUser ? (
        <Box sx={{ mb: 3 }}>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            {formatJson(currentUser)}
          </pre>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>No user is currently logged in</Alert>
      )}
      
      <Typography variant="h6" gutterBottom>LocalStorage Data</Typography>
      {Object.keys(localStorageData).length > 0 ? (
        <Box sx={{ mb: 3 }}>
          {Object.keys(localStorageData).map(key => (
            <Accordion key={key} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{key}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {formatJson(localStorageData[key])}
                </pre>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>No WMS-related data found in localStorage</Alert>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">
          This tool helps diagnose user authentication and settings persistence issues.
          If you're experiencing problems with admin access or settings not being saved,
          check the data displayed here.
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserDebugger;
