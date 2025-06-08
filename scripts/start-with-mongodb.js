/**
 * Start Application with MongoDB Atlas Connection
 * 
 * This script starts the WMS Tutorial Application with the correct
 * environment variables to connect to MongoDB Atlas.
 */

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables for the child process
const env = {
  ...process.env,
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/test?retryWrites=true&w=majority',
  JWT_SECRET: 'your-development-secret-key'
};

console.log('Starting application with MongoDB Atlas connection...');
console.log('Environment variables set:');
console.log('- NODE_ENV:', env.NODE_ENV);
console.log('- MONGODB_URI: [set]');
console.log('- JWT_SECRET: [set]');

// Get the npm executable path
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

// Start the application with the environment variables
const child = spawn(npmCmd, ['start'], {
  env,
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`Application exited with code ${code}`);
});

console.log('Application starting...');
