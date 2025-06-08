import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Table, Badge, Spinner, Form } from 'react-bootstrap';
import config from '../../config';

/**
 * API Debugger Component
 * 
 * This component helps diagnose API connection issues by testing various endpoints
 * and displaying detailed information about the requests and responses.
 */
const ApiDebugger = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('wms_auth_token') || '');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  
  // Parse the token on component mount
  useEffect(() => {
    if (authToken) {
      try {
        const parts = authToken.split(':');
        if (parts.length === 3) {
          setUserId(parts[0]);
          setUsername(parts[1]);
          setRole(parts[2]);
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, [authToken]);

  // List of endpoints to test
  const endpoints = [
    { name: 'Test Authentication', path: '/api/test-authentication', method: 'GET' },
    { name: 'Get User Settings', path: `/api/getUserSettings?userId=${userId}`, method: 'GET' },
    { name: 'Get Processes', path: '/api/getProcesses', method: 'GET' },
    { name: 'Get Presentations', path: '/api/getPresentations', method: 'GET' },
    { name: 'MongoDB Connection Test', path: '/api/test-mongodb-connection', method: 'GET' }
  ];

  // Test a single endpoint
  const testEndpoint = async (endpoint) => {
    try {
      console.log(`Testing endpoint: ${endpoint.path}`);
      
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const status = response.status;
      let data;
      
      try {
        data = await response.json();
      } catch (e) {
        data = { error: 'Could not parse JSON response' };
      }
      
      return {
        endpoint: endpoint.name,
        path: endpoint.path,
        status,
        success: status >= 200 && status < 300,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error testing ${endpoint.path}:`, error);
      return {
        endpoint: endpoint.name,
        path: endpoint.path,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  };

  // Run all tests
  const runTests = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      const testResults = [];
      
      for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        testResults.push(result);
        // Update results incrementally
        setResults(prev => [...prev, result]);
      }
      
      console.log('All tests completed:', testResults);
    } catch (error) {
      console.error('Error running tests:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update token in localStorage
  const updateToken = () => {
    const newToken = `${userId}:${username}:${role}`;
    localStorage.setItem('wms_auth_token', newToken);
    setAuthToken(newToken);
    alert(`Token updated to: ${newToken}`);
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">API Connection Debugger</Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger">
            Error: {error}
          </Alert>
        )}
        
        <h6>Authentication Token</h6>
        <div className="mb-3 p-2 bg-light border rounded">
          <code>{authToken || 'No token found'}</code>
        </div>
        
        <Form className="mb-3">
          <Form.Group className="mb-2">
            <Form.Label>User ID</Form.Label>
            <Form.Control 
              type="text" 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>Username</Form.Label>
            <Form.Control 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-2">
            <Form.Label>Role</Form.Label>
            <Form.Control 
              type="text" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
            />
          </Form.Group>
          
          <Button 
            variant="secondary" 
            onClick={updateToken}
            className="me-2"
          >
            Update Token
          </Button>
        </Form>
        
        <h6>API Configuration</h6>
        <div className="mb-3 p-2 bg-light border rounded">
          <div><strong>API URL:</strong> {config.apiUrl}</div>
          <div><strong>Development Mode:</strong> {config.development?.debugMode ? 'Yes' : 'No'}</div>
          <div><strong>Disable Fallback:</strong> {config.development?.disableFallback ? 'Yes' : 'No'}</div>
        </div>
        
        <Button 
          variant="primary" 
          onClick={runTests}
          disabled={loading}
          className="mb-3"
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Testing...
            </>
          ) : 'Test API Endpoints'}
        </Button>
        
        {results.length > 0 && (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Result</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>
                    <div>{result.endpoint}</div>
                    <small className="text-muted">{result.path}</small>
                  </td>
                  <td>
                    {result.status ? result.status : 'N/A'}
                  </td>
                  <td>
                    {result.success ? (
                      <Badge bg="success">Success</Badge>
                    ) : (
                      <Badge bg="danger">Failed</Badge>
                    )}
                  </td>
                  <td>
                    <pre className="small" style={{ maxHeight: '150px', overflow: 'auto' }}>
                      {JSON.stringify(result.data || result.error, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default ApiDebugger;
