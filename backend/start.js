
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Insurance Management System Backend...\n');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
const packageJsonPath = path.join(__dirname, 'package.json');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  
  exec('npm install', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error installing dependencies:', error);
      return;
    }
    
    console.log('✅ Dependencies installed successfully');
    startServer();
  });
} else {
  console.log('✅ Dependencies already installed');
  startServer();
}

function startServer() {
  console.log('🌟 Starting server...\n');
  
  const server = spawn('node', ['server.js'], { 
    cwd: __dirname,
    stdio: 'inherit'
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  server.on('close', (code) => {
    console.log(`\n🔴 Server process exited with code ${code}`);
  });
}
