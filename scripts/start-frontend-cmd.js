#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ProofMe Frontend (Command Prompt Method)...');
console.log('=====================================================\n');

// Check if frontend directory exists
if (!fs.existsSync('frontend')) {
  console.error('❌ Frontend directory not found!');
  process.exit(1);
}

console.log('🎯 Starting development server using Command Prompt...');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('💡 Press Ctrl+C to stop the server');

try {
  // Use cmd to bypass PowerShell restrictions
  execSync('cmd /c "cd frontend && npm run dev"', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.error('❌ Failed to start frontend:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Make sure you have Node.js installed');
  console.log('2. Try running: cmd /c "cd frontend && npm install && npm run dev"');
  console.log('3. Or enable PowerShell execution: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser');
} 