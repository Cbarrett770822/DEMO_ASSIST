const http = require('http');

// Function to check if a port is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use`);
        resolve(true);
      } else {
        console.log(`Error checking port ${port}:`, err.message);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      console.log(`Port ${port} is available`);
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Check common ports
async function checkPorts() {
  console.log('Checking Netlify server ports...');
  
  const ports = [3000, 3001, 8888, 8889];
  
  for (const port of ports) {
    const inUse = await checkPort(port);
    console.log(`Port ${port}: ${inUse ? 'IN USE' : 'AVAILABLE'}`);
  }
  
  console.log('\nChecking if Netlify functions server is accessible...');
  
  // Try to connect to the Netlify functions server on different ports
  for (const port of ports) {
    try {
      const req = http.request({
        hostname: 'localhost',
        port: port,
        path: '/.netlify/functions/test-db-connection',
        method: 'GET',
        timeout: 2000
      }, (res) => {
        console.log(`Port ${port} - Response status: ${res.statusCode}`);
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            console.log(`Port ${port} - Response data:`, JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log(`Port ${port} - Response data (not JSON):`, data.substring(0, 100) + (data.length > 100 ? '...' : ''));
          }
        });
      });
      
      req.on('error', (e) => {
        console.log(`Port ${port} - Error connecting: ${e.message}`);
      });
      
      req.end();
    } catch (e) {
      console.log(`Port ${port} - Error making request: ${e.message}`);
    }
  }
}

checkPorts().catch(err => console.error('Error checking ports:', err));
