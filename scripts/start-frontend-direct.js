#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ProofMe Frontend (Direct Method)...');
console.log('=============================================\n');

// Check if frontend directory exists
if (!fs.existsSync('frontend')) {
  console.error('❌ Frontend directory not found!');
  process.exit(1);
}

// Check if frontend dependencies are installed
if (!fs.existsSync('frontend/node_modules')) {
  console.log('📦 Installing frontend dependencies...');
  try {
    // Use node directly to install dependencies
    execSync('node node_modules/npm/bin/npm-cli.js install', { 
      stdio: 'inherit', 
      cwd: path.join(process.cwd(), 'frontend') 
    });
    console.log('✅ Frontend dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install frontend dependencies:', error.message);
    console.log('💡 Trying alternative installation method...');
    try {
      execSync('cmd /c "cd frontend && npm install"', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Frontend dependencies installed via cmd');
    } catch (cmdError) {
      console.error('❌ Failed to install via cmd:', cmdError.message);
      process.exit(1);
    }
  }
}

console.log('🎯 Starting development server...');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('💡 Press Ctrl+C to stop the server');

try {
  // Try multiple methods to start the frontend
  console.log('\n🔄 Attempting to start frontend...');
  
  // Method 1: Direct node execution
  try {
    console.log('📋 Method 1: Direct Node.js execution...');
    execSync('node node_modules/vite/bin/vite.js', { 
      stdio: 'inherit', 
      cwd: path.join(process.cwd(), 'frontend') 
    });
  } catch (method1Error) {
    console.log('❌ Method 1 failed, trying Method 2...');
    
    // Method 2: Command Prompt
    try {
      console.log('📋 Method 2: Command Prompt execution...');
      execSync('cmd /c "cd frontend && npm run dev"', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (method2Error) {
      console.log('❌ Method 2 failed, trying Method 3...');
      
      // Method 3: Direct vite execution
      try {
        console.log('📋 Method 3: Direct Vite execution...');
        execSync('node frontend/node_modules/vite/bin/vite.js', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
      } catch (method3Error) {
        console.error('❌ All methods failed!');
        console.log('\n💡 Manual steps to try:');
        console.log('1. Open Command Prompt (not PowerShell)');
        console.log('2. Navigate to your project: cd D:\\Koding\\ProofMe');
        console.log('3. Run: cd frontend && npm run dev');
        console.log('4. Or enable PowerShell: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser');
        
        console.log('\n📋 Error details:');
        console.log('Method 1 error:', method1Error.message);
        console.log('Method 2 error:', method2Error.message);
        console.log('Method 3 error:', method3Error.message);
      }
    }
  }
} catch (error) {
  console.error('❌ Failed to start frontend:', error.message);
} 