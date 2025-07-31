#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Compiling ProofMe contracts directly...');

// Create artifacts directory if it doesn't exist
const artifactsDir = './artifacts/contracts';
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

try {
  // Check if contracts exist
  const contractsDir = './contracts';
  const contracts = fs.readdirSync(contractsDir).filter(file => file.endsWith('.sol'));
  
  if (contracts.length === 0) {
    console.error('❌ No Solidity contracts found in contracts/ directory');
    process.exit(1);
  }
  
  console.log(`📄 Found ${contracts.length} contract(s): ${contracts.join(', ')}`);
  
  // For now, let's just verify the contracts can be parsed
  contracts.forEach(contract => {
    const contractPath = path.join(contractsDir, contract);
    const content = fs.readFileSync(contractPath, 'utf8');
    
    // Basic syntax check - look for common Solidity patterns
    if (!content.includes('pragma solidity')) {
      console.error(`❌ ${contract}: Missing pragma solidity directive`);
      process.exit(1);
    }
    
    if (!content.includes('contract')) {
      console.error(`❌ ${contract}: No contract definition found`);
      process.exit(1);
    }
    
    console.log(`✅ ${contract}: Basic syntax check passed`);
  });
  
  console.log('\n✅ All contracts passed basic syntax checks!');
  console.log('💡 Note: This is a basic check. For full compilation, install Circom and SnarkJS:');
  console.log('   npm install -g circom snarkjs');
  console.log('   Then run: node scripts/compile-zk.js');
  
} catch (error) {
  console.error('❌ Failed to check contracts:', error.message);
  process.exit(1);
} 