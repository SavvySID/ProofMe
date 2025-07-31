#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging ProofMe Frontend...');
console.log('================================\n');

// Check if frontend is running
console.log('📋 Checking if frontend is running...');
try {
  const response = execSync('curl -s http://localhost:3000', { encoding: 'utf8' });
  if (response.includes('<!DOCTYPE html>') || response.includes('<html>')) {
    console.log('✅ Frontend is responding at http://localhost:3000');
  } else {
    console.log('⚠️  Frontend is responding but content seems empty');
  }
} catch (error) {
  console.log('❌ Frontend is not running at http://localhost:3000');
  console.log('   Error:', error.message);
}

// Check if local Hardhat network is running
console.log('\n📋 Checking if local Hardhat network is running...');
try {
  const response = execSync('curl -s http://localhost:8545', { encoding: 'utf8' });
  console.log('✅ Local Hardhat network is running at http://localhost:8545');
} catch (error) {
  console.log('❌ Local Hardhat network is not running at http://localhost:8545');
  console.log('   Error:', error.message);
}

// Check frontend dependencies
console.log('\n📋 Checking frontend dependencies...');
if (fs.existsSync('frontend/node_modules')) {
  console.log('✅ Frontend dependencies are installed');
} else {
  console.log('❌ Frontend dependencies are not installed');
}

// Check if vite is available
console.log('\n📋 Checking if Vite is available...');
if (fs.existsSync('frontend/node_modules/vite')) {
  console.log('✅ Vite is installed');
} else {
  console.log('❌ Vite is not installed');
}

console.log('\n🎯 Solutions:');
console.log('=============');

console.log('\n1. Start local Hardhat network:');
console.log('   npx hardhat node');

console.log('\n2. Start frontend (in a new terminal):');
console.log('   cd frontend');
console.log('   npm run dev');

console.log('\n3. Check browser console for errors:');
console.log('   - Press F12 in your browser');
console.log('   - Look at the Console tab for errors');

console.log('\n4. If still white screen, try:');
console.log('   - Clear browser cache');
console.log('   - Try a different browser');
console.log('   - Check if MetaMask is connected to localhost:8545');

console.log('\n💡 Quick test:');
console.log('Open http://localhost:3000 in your browser and check the console (F12) for any error messages.'); 