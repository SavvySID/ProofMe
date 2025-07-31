#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ProofMe Frontend...');
console.log('================================\n');

// Check if frontend directory exists
if (!fs.existsSync('frontend')) {
  console.error('❌ Frontend directory not found!');
  process.exit(1);
}

// Check if frontend dependencies are installed
if (!fs.existsSync('frontend/node_modules')) {
  console.log('📦 Installing frontend dependencies...');
  try {
    execSync('npm install', { 
      stdio: 'inherit', 
      cwd: path.join(process.cwd(), 'frontend') 
    });
    console.log('✅ Frontend dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install frontend dependencies:', error.message);
    process.exit(1);
  }
}

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  .env file not found. Running environment setup...');
  try {
    execSync('node scripts/update-env.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to setup environment:', error.message);
  }
}

console.log('🎯 Starting development server...');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('💡 Press Ctrl+C to stop the server');

try {
  // Start the frontend using node directly to bypass PowerShell restrictions
  execSync('node node_modules/vite/bin/vite.js', { 
    stdio: 'inherit', 
    cwd: path.join(process.cwd(), 'frontend') 
  });
} catch (error) {
  console.error('❌ Failed to start frontend:', error.message);
  console.log('\n💡 Alternative methods:');
  console.log('1. Use Command Prompt instead of PowerShell');
  console.log('2. Run: cmd /c "cd frontend && npm run dev"');
  console.log('3. Or enable PowerShell execution: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser');
} 