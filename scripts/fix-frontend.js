#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing ProofMe Frontend...');
console.log('=============================\n');

// Check if we're in the right directory
if (!fs.existsSync('frontend')) {
  console.error('❌ Frontend directory not found!');
  process.exit(1);
}

console.log('📋 Current issues:');
console.log('1. PowerShell execution policy blocking npm commands');
console.log('2. Frontend configured for Citrea testnet instead of localhost');
console.log('3. Need to start local Hardhat network first');

console.log('\n🎯 Solutions:');
console.log('=============');

console.log('\n1. Start local Hardhat network (in a new terminal):');
console.log('   npx hardhat node');

console.log('\n2. Start frontend using Command Prompt:');
console.log('   cmd /c "cd frontend && npm run dev"');

console.log('\n3. Or enable PowerShell execution (as Administrator):');
console.log('   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser');

console.log('\n4. Alternative: Use Node directly:');
console.log('   node frontend/node_modules/vite/bin/vite.js');

console.log('\n💡 Quick fix - try this command:');
console.log('cmd /c "cd frontend && npm run dev"');

console.log('\n📱 Once running, visit: http://localhost:3000');
console.log('🔗 Make sure MetaMask is connected to localhost:8545'); 