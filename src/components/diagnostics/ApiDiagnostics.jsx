import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { testAllEndpoints } from '../../utils/apiTester';
import { getApiBaseUrl, shouldUseDevelopmentFallbacks } from '../../utils/environmentUtils';
import config from '../../config';

const ApiDiagnostics = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [configInfo, setConfigInfo] = useState({});

  useEffect(() => {
    // Gather configuration information
    setConfigInfo({
      apiBaseUrl: getApiBaseUrl(),
      disableFallback: config?.development?.disableFallback === true,
      shouldUseFallbacks: shouldUseDevelopmentFallbacks(),
      debugMode: config?.development?.debugMode === true,
      envVars: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        DISABLE_DEV_FALLBACK: process.env.DISABLE_DEV_FALLBACK || 'not set',
        DEBUG_DB_CONNECTION: process.env.DEBUG_DB_CONNECTION || 'not set',
        MONGODB_URI: process.env.MONGODB_URI ? 'set (masked)' : 'not set'
      }
    });
  }, []);

  const runTests = async (includeAuth = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const testResults = await testAllEndpoints(includeAuth);
      setResults(testResults);
    } catch (err) {
      console.error('Error running API tests:', err);
      setError(err.message || 'Failed to run API tests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (success) => {
    return success ? 
      <Chip label="Success" color="success" size="small" /> : 
      <Chip label="Failed" color="error" size="small" />;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>API Diagnostics</Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>Configuration</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">API Base URL</TableCell>
                <TableCell>{configInfo.apiBaseUrl}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Development Fallback</TableCell>
                <TableCell>{configInfo.disableFallback ? 'Disabled' : 'Enabled'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Using Fallbacks</TableCell>
                <TableCell>{configInfo.shouldUseFallbacks ? 'Yes' : 'No'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">Debug Mode</TableCell>
                <TableCell>{configInfo.debugMode ? 'Enabled' : 'Disabled'}</TableCell>
              </TableRow>
              {Object.entries(configInfo.envVars || {}).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell component="th" scope="row">{key}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => runTests(false)} 
          disabled={loading}
        >
          Test Basic Endpoints
        </Button>
        <Button 
          variant="contained" 
          onClick={() => runTests(true)} 
          disabled={loading}
        >
          Test All Endpoints
        </Button>
        {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Box>
          <Typography variant="h6" gutterBottom>Test Results</Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Summary</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total Tests</TableCell>
                    <TableCell>{results.summary.total}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Successful</TableCell>
                    <TableCell>{results.summary.successful}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Failed</TableCell>
                    <TableCell>{results.summary.failed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Auth Errors</TableCell>
                    <TableCell>{results.summary.authErrors}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Network Errors</TableCell>
                    <TableCell>{results.summary.networkErrors}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Typography variant="subtitle1" gutterBottom>Endpoint Details</Typography>
          {Object.entries(results.endpoints).map(([name, result]) => (
            <Accordion key={name} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography>{name}</Typography>
                  <Box>
                    {getStatusChip(result.success)}
                    <Chip 
                      label={`${result.statusCode || 'N/A'}`} 
                      color={result.success ? "primary" : "warning"} 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                    <Chip 
                      label={`${result.responseTime}ms`} 
                      variant="outlined" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Endpoint:</strong> {result.endpoint}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Method:</strong> {result.method}
                  </Typography>
                  {result.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {result.error}
                    </Alert>
                  )}
                  {result.data && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>Response Data</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default ApiDiagnostics;
