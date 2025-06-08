import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isAdmin } from '../../services/authService';
import config from '../../config';

const DatabaseViewer = () => {
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchDatabaseData = async () => {
    if (!isAdmin()) {
      setError('Admin access required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('wms_auth_token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`${config.apiUrl}/view-db-data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retrieve database data');
      }
      
      const data = await response.json();
      setDbData(data.data);
    } catch (error) {
      console.error('Error fetching database data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDatabaseData();
  }, []);
  
  // Format JSON data for display
  const formatJsonValue = (value) => {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  };
  
  if (!isAdmin()) {
    return (
      <Alert severity="error">
        Admin access required to view database data
      </Alert>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            MongoDB Database Viewer
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDatabaseData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : !dbData ? (
          <Alert severity="info">
            No database data available
          </Alert>
        ) : (
          <Box>
            {Object.keys(dbData).length === 0 ? (
              <Alert severity="info">
                No collections found in the database
              </Alert>
            ) : (
              Object.keys(dbData).map((collectionName) => (
                <Accordion key={collectionName} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Collection: {collectionName} ({dbData[collectionName].length} documents)
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {dbData[collectionName].length === 0 ? (
                      <Alert severity="info">
                        No documents in this collection
                      </Alert>
                    ) : (
                      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Document ID</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dbData[collectionName].map((document) => (
                              <TableRow key={document._id}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {document._id}
                                </TableCell>
                                <TableCell>
                                  <pre style={{ 
                                    margin: 0, 
                                    whiteSpace: 'pre-wrap', 
                                    wordBreak: 'break-word',
                                    maxHeight: '200px',
                                    overflow: 'auto'
                                  }}>
                                    {JSON.stringify(document, null, 2)}
                                  </pre>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DatabaseViewer;
