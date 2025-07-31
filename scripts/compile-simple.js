#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔨 Compiling ProofMe contracts...');

try {
  // Use node to run hardhat directly
  execSync('node node_modules/hardhat/internal/cli/cli.js compile', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Contracts compiled successfully!');
} catch (error) {
  console.error('❌ Failed to compile contracts:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Make sure all dependencies are installed: npm install');
  console.log('2. Check that Solidity files have correct syntax');
  console.log('3. Try running: node scripts/compile-simple.js');
  process.exit(1);
} 