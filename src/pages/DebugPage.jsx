import React from 'react';
import { Container, Row, Col, Card, Nav, Tab, Button, Table } from 'react-bootstrap';
import ApiDebugger from '../components/debug/ApiDebugger';

/**
 * Debug Page
 * 
 * This page provides various debugging tools to help diagnose and fix issues
 * with the WMS Tutorial Application.
 */
const DebugPage = () => {
  return (
    <Container className="py-4">
      <h1 className="mb-4">System Diagnostics</h1>
      
      <Tab.Container defaultActiveKey="api">
        <Row>
          <Col md={3} className="mb-3">
            <Card>
              <Card.Header>Debug Tools</Card.Header>
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="api">API Diagnostics</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="auth">Authentication</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="storage">Local Storage</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="mongodb">MongoDB</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card>
          </Col>
          
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="api">
                <ApiDebugger />
              </Tab.Pane>
              
              <Tab.Pane eventKey="auth">
                <Card>
                  <Card.Header as="h5">Authentication Debugger</Card.Header>
                  <Card.Body>
                    <h6>Current Authentication State</h6>
                    <AuthDebugInfo />
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              <Tab.Pane eventKey="storage">
                <Card>
                  <Card.Header as="h5">Local Storage Inspector</Card.Header>
                  <Card.Body>
                    <LocalStorageDebugger />
                  </Card.Body>
                </Card>
              </Tab.Pane>
              
              <Tab.Pane eventKey="mongodb">
                <Card>
                  <Card.Header as="h5">MongoDB Connection Test</Card.Header>
                  <Card.Body>
                    <MongoDbTester />
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

// Authentication Debug Component
const AuthDebugInfo = () => {
  const token = localStorage.getItem('wms_auth_token') || 'No token found';
  let userId = 'N/A';
  let username = 'N/A';
  let role = 'N/A';
  
  // Parse token if available
  if (token && token !== 'No token found') {
    try {
      const parts = token.split(':');
      if (parts.length === 3) {
        userId = parts[0];
        username = parts[1];
        role = parts[2];
      }
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  }
  
  return (
    <div>
      <div className="mb-3 p-2 bg-light border rounded">
        <div><strong>Token:</strong> <code>{token}</code></div>
        <div><strong>User ID:</strong> {userId}</div>
        <div><strong>Username:</strong> {username}</div>
        <div><strong>Role:</strong> {role}</div>
      </div>
    </div>
  );
};

// Local Storage Debugger Component
const LocalStorageDebugger = () => {
  const [storageItems, setStorageItems] = React.useState([]);
  
  React.useEffect(() => {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);
      
      // Try to parse JSON values
      try {
        if (value.startsWith('{') || value.startsWith('[')) {
          const parsed = JSON.parse(value);
          value = parsed;
        }
      } catch (e) {
        // Keep as string if parsing fails
      }
      
      items.push({ key, value });
    }
    setStorageItems(items);
  }, []);
  
  return (
    <div>
      <h6>LocalStorage Contents</h6>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {storageItems.map((item, index) => (
            <tr key={index}>
              <td>{item.key}</td>
              <td>
                <pre className="small" style={{ maxHeight: '100px', overflow: 'auto' }}>
                  {typeof item.value === 'object' 
                    ? JSON.stringify(item.value, null, 2) 
                    : item.value}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

// MongoDB Tester Component
const MongoDbTester = () => {
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-mongodb-connection', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('wms_auth_token')}`
        }
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Button 
        variant="primary" 
        onClick={testConnection}
        disabled={loading}
        className="mb-3"
      >
        {loading ? 'Testing...' : 'Test MongoDB Connection'}
      </Button>
      
      {result && (
        <div className="mt-3">
          <h6>Test Result</h6>
          <pre className="p-2 bg-light border rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugPage;
