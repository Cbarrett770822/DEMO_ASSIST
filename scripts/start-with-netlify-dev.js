/**
 * Start Application with Netlify Dev
 * 
 * This script starts the WMS Tutorial Application with Netlify Dev
 * to properly handle serverless functions and environment variables.
 * Includes auto-restart capabilities and improved error handling.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const MAX_RESTART_ATTEMPTS = 5;
const RESTART_DELAY_MS = 3000;
let restartCount = 0;
let lastCrashTime = 0;
let netlifyProcess = null;

// Create a .env file with the MongoDB Atlas connection string
// Use the correct MongoDB Atlas connection string with the proper hostname
const envContent = `
NODE_ENV=development
MONGODB_URI=mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test
JWT_SECRET=your-development-secret-key
FORCE_MOCK_DATA=false
REACT_APP_DEV_MODE=true
DISABLE_DEV_FALLBACK=true
DEBUG_DB_CONNECTION=true
PORT=3001
NETLIFY_FUNCTIONS_PORT=8889
`;

// Write the .env file
try {
  fs.writeFileSync(path.resolve(__dirname, '..', '.env.development.local'), envContent.trim());
  console.log('✅ Created .env.development.local file with MongoDB Atlas connection string');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  process.exit(1);
}

// Function to kill existing processes that might conflict
function killConflictingProcesses() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Checking for conflicting processes...');
    
    // Get list of running processes
    const findCmd = process.platform === 'win32' ? 'tasklist' : 'ps';
    const findArgs = process.platform === 'win32' ? ['/FO', 'CSV'] : ['-e'];
    
    const findProcess = spawn(findCmd, findArgs, { stdio: ['ignore', 'pipe', 'ignore'] });
    
    let processOutput = '';
    findProcess.stdout.on('data', (data) => {
      processOutput += data.toString();
    });
    
    findProcess.on('close', (code) => {
      if (code !== 0) {
        console.warn('⚠️ Could not check running processes, proceeding anyway');
        resolve();
        return;
      }
      
      // Look for netlify and node processes that might be running our servers
      const processesToKill = [];
      const lines = processOutput.split('\n');
      
      // On Windows, parse the CSV output
      if (process.platform === 'win32') {
        lines.forEach(line => {
          // Skip header line
          if (line.includes('"Image Name"')) return;
          
          const parts = line.split('","');
          if (parts.length >= 2) {
            const processName = parts[0].replace('"', '');
            const pid = parts[1].replace('"', '');
            
            // Check for netlify processes
            if (processName.toLowerCase().includes('netlify')) {
              processesToKill.push({ name: processName, pid });
              return;
            }
            
            // Check for node processes running on our ports
            if (processName.toLowerCase() === 'node.exe') {
              // We'll check if this process is using our ports in the next step
              processesToKill.push({ name: processName, pid, checkPort: true });
            }
          }
        });
      } else {
        // On Unix-like systems, parse ps output
        lines.forEach(line => {
          if (line.includes('netlify') || 
              (line.includes('node') && 
               (line.includes('react-scripts') || line.includes('netlify')))) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
              const pid = parts[0];
              const processName = parts.slice(4).join(' ');
              processesToKill.push({ name: processName, pid });
            }
          }
        });
      }
      
      // Check if we need to verify port usage for any processes
      const processesToVerify = processesToKill.filter(proc => proc.checkPort);
      const processesToDefinitelyKill = processesToKill.filter(proc => !proc.checkPort);
      
      // If we have processes to verify, check which ports they're using
      if (processesToVerify.length > 0) {
        // Run netstat to check which processes are using our ports
        const netstatCmd = process.platform === 'win32' ? 'netstat' : 'ss';
        const netstatArgs = process.platform === 'win32' ? ['-ano'] : ['-tuln', '-p'];
        
        const netstatProcess = spawn(netstatCmd, netstatArgs, { stdio: ['ignore', 'pipe', 'ignore'] });
        
        let netstatOutput = '';
        netstatProcess.stdout.on('data', (data) => {
          netstatOutput += data.toString();
        });
        
        netstatProcess.on('close', (code) => {
          if (code !== 0) {
            console.warn('⚠️ Could not check port usage, proceeding with caution');
            // If we can't check ports, we'll only kill processes we're certain about
            continueWithKilling(processesToDefinitelyKill);
            return;
          }
          
          // Check which processes are using our target ports (8889 or 3001)
          const confirmedProcesses = [];
          
          processesToVerify.forEach(proc => {
            // On Windows, the PID is in the last column of netstat output
            if (process.platform === 'win32') {
              const lines = netstatOutput.split('\n');
              for (const line of lines) {
                if ((line.includes(':8889') || line.includes(':3001')) && 
                    line.includes(proc.pid)) {
                  confirmedProcesses.push(proc);
                  break;
                }
              }
            } else {
              // On Unix, the PID is in the 'users' column
              if (netstatOutput.includes(`:8889`) && netstatOutput.includes(proc.pid) || 
                  netstatOutput.includes(`:3001`) && netstatOutput.includes(proc.pid)) {
                confirmedProcesses.push(proc);
              }
            }
          });
          
          // Combine confirmed processes with those we definitely want to kill
          const finalProcessesToKill = [...processesToDefinitelyKill, ...confirmedProcesses];
          continueWithKilling(finalProcessesToKill);
        });
      } else {
        // No processes to verify, proceed with killing the definite ones
        continueWithKilling(processesToDefinitelyKill);
      }
      
      function continueWithKilling(processes) {
        // If no conflicting processes found, resolve immediately
        if (processes.length === 0) {
          console.log('✅ No conflicting processes found');
          resolve();
          return;
        }
        
        console.log(`🛑 Found ${processes.length} conflicting processes:`);
        processes.forEach(proc => {
          console.log(`   - ${proc.name} (PID: ${proc.pid})${proc.checkPort ? ' (using our ports)' : ''}`);
        });
        
        // Kill the processes
        const killPromises = processes.map(proc => {
          return new Promise((resolveKill) => {
            const killCmd = process.platform === 'win32' ? 'taskkill' : 'kill';
            const killArgs = process.platform === 'win32' ? ['/F', '/PID', proc.pid] : ['-9', proc.pid];
            
            const killProcess = spawn(killCmd, killArgs);
            
            killProcess.on('close', (killCode) => {
              if (killCode === 0) {
                console.log(`✅ Successfully terminated process ${proc.name} (PID: ${proc.pid})`);
              } else {
                console.warn(`⚠️ Failed to terminate process ${proc.name} (PID: ${proc.pid})`);
              }
              resolveKill();
            });
          });
        });
        
        // Wait for all kill commands to complete
        Promise.all(killPromises).then(() => {
          console.log('✅ Finished cleaning up conflicting processes');
          // Wait a moment for ports to be released
          setTimeout(() => {
            resolve();
          }, 1000);
        });
      }
    });
  });
}

// Function to check if ports are in use
function checkPorts() {
  return new Promise((resolve, reject) => {
    const netstat = spawn(process.platform === 'win32' ? 'netstat' : 'ss', 
      process.platform === 'win32' ? ['-ano'] : ['-tuln'],
      { stdio: ['ignore', 'pipe', 'ignore'] }
    );
    
    let output = '';
    netstat.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    netstat.on('close', (code) => {
      if (code !== 0) {
        console.warn('⚠️ Could not check port usage, proceeding anyway');
        resolve(true);
        return;
      }
      
      const port8889InUse = output.includes(':8889');
      const port3001InUse = output.includes(':3001');
      
      if (port8889InUse) {
        console.warn('⚠️ Port 8889 appears to be in use. This may cause conflicts.');
      }
      
      if (port3001InUse) {
        console.warn('⚠️ Port 3001 appears to be in use. This may cause conflicts.');
      }
      
      resolve(true);
    });
  });
}

// Function to start Netlify Dev
function startNetlifyDev() {
  console.log('\n🚀 Starting application with Netlify Dev on port 8889...');
  console.log('Environment variables set:');
  console.log('- NODE_ENV: development');
  console.log('- MONGODB_URI: [set to MongoDB Atlas]');
  console.log('- JWT_SECRET: [set]');
  console.log('- PORT: 3001');
  console.log('- NETLIFY_FUNCTIONS_PORT: 8889');
  
  // Get the netlify executable path
  const netlifyCmd = process.platform === 'win32' ? 'netlify.cmd' : 'netlify';
  
  // Start the application with Netlify Dev (on port 8889)
  netlifyProcess = spawn(netlifyCmd, ['dev', '--port', '8889', '--target-port', '3001'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' } // Force colored output
  });
  
  netlifyProcess.on('error', (error) => {
    console.error(`\n❌ Failed to start Netlify Dev: ${error.message}`);
    if (restartCount < MAX_RESTART_ATTEMPTS) {
      restartNetlifyDev();
    } else {
      console.error('\n❌ Maximum restart attempts reached. Please check your configuration and try again manually.');
      process.exit(1);
    }
  });
  
  netlifyProcess.on('close', (code) => {
    const currentTime = Date.now();
    const timeSinceLastCrash = currentTime - lastCrashTime;
    lastCrashTime = currentTime;
    
    if (code === 0) {
      console.log('\n✅ Netlify Dev shut down gracefully.');
      process.exit(0);
    } else {
      console.error(`\n❌ Netlify Dev exited unexpectedly with code ${code}`);
      
      // If it crashed quickly after the last crash, increment the counter
      // Otherwise, reset the counter (it was running for a while before crashing)
      if (timeSinceLastCrash < 10000) { // 10 seconds
        restartCount++;
      } else {
        restartCount = 0; // Reset counter if it was running for a while
      }
      
      if (restartCount < MAX_RESTART_ATTEMPTS) {
        restartNetlifyDev();
      } else {
        console.error('\n❌ Maximum restart attempts reached. Please check your configuration and try again manually.');
        process.exit(1);
      }
    }
  });
  
  console.log('\n⏳ Netlify Dev starting...');
}

// Function to restart Netlify Dev
function restartNetlifyDev() {
  console.log(`\n🔄 Restarting Netlify Dev (attempt ${restartCount + 1}/${MAX_RESTART_ATTEMPTS})...`);
  console.log(`Waiting ${RESTART_DELAY_MS / 1000} seconds before restart...`);
  
  setTimeout(() => {
    startNetlifyDev();
  }, RESTART_DELAY_MS);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT. Shutting down Netlify Dev...');
  if (netlifyProcess) {
    netlifyProcess.kill('SIGINT');
  }
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM. Shutting down Netlify Dev...');
  if (netlifyProcess) {
    netlifyProcess.kill('SIGTERM');
  }
});

// Start the application
killConflictingProcesses()
  .then(() => checkPorts())
  .then(() => {
    startNetlifyDev();
  })
  .catch(error => {
    console.error('❌ Error during startup:', error);
    process.exit(1);
  });
