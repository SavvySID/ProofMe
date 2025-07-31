#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 Compiling ZK Circuit for ProofMe');
console.log('====================================\n');

// Check if circuit file exists
if (!fs.existsSync('zk/ageCheck.circom')) {
  console.error('❌ Circuit file zk/ageCheck.circom not found!');
  process.exit(1);
}

// Check if Circom is installed
console.log('🔍 Checking Circom installation...');
try {
  execSync('circom --version', { stdio: 'pipe' });
  console.log('✅ Circom is installed');
} catch (error) {
  console.error('❌ Circom not found. Please install it:');
  console.log('   npm install -g circom');
  console.log('   Or visit: https://docs.circom.io/getting-started/installation/');
  process.exit(1);
}

// Check if SnarkJS is installed
console.log('🔍 Checking SnarkJS installation...');
try {
  execSync('snarkjs --version', { stdio: 'pipe' });
  console.log('✅ SnarkJS is installed');
} catch (error) {
  console.error('❌ SnarkJS not found. Please install it:');
  console.log('   npm install -g snarkjs');
  process.exit(1);
}

// Check if powersOfTau file exists
const powersOfTauPath = 'node_modules/circomlib/powersOfTau28_hez_final_10.ptau';
if (!fs.existsSync(powersOfTauPath)) {
  console.log('📥 Downloading powersOfTau file...');
  try {
    execSync(`curl -o ${powersOfTauPath} https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau`, { stdio: 'inherit' });
    console.log('✅ powersOfTau file downloaded');
  } catch (error) {
    console.error('❌ Failed to download powersOfTau file. Please download it manually:');
    console.log('   https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau');
    console.log('   And place it in: node_modules/circomlib/');
    process.exit(1);
  }
}

try {
  // Compile the circuit
  console.log('📝 Compiling ageCheck circuit...');
  execSync('cd zk && circom ageCheck.circom --r1cs --wasm --sym', { stdio: 'inherit' });
  console.log('✅ Circuit compiled');
  
  // Generate proving key
  console.log('🔑 Generating proving key...');
  execSync('cd zk && snarkjs groth16 setup ageCheck.r1cs ../node_modules/circomlib/powersOfTau28_hez_final_10.ptau ageCheck_0000.zkey', { stdio: 'inherit' });
  console.log('✅ Proving key generated');
  
  // Contribute to phase 2 of the ceremony
  console.log('🎭 Contributing to phase 2...');
  execSync('cd zk && snarkjs zkey contribute ageCheck_0000.zkey ageCheck_final.zkey', { stdio: 'inherit' });
  console.log('✅ Phase 2 contribution completed');
  
  // Export verification key
  console.log('🔍 Exporting verification key...');
  execSync('cd zk && snarkjs zkey export verificationkey ageCheck_final.zkey verification_key.json', { stdio: 'inherit' });
  console.log('✅ Verification key exported');
  
  // Generate Solidity verifier
  console.log('📄 Generating Solidity verifier...');
  execSync('cd zk && snarkjs zkey export solidityverifier ageCheck_final.zkey ../contracts/AgeVerifier.sol', { stdio: 'inherit' });
  console.log('✅ Solidity verifier generated');
  
  // Clean up intermediate files
  console.log('🧹 Cleaning up intermediate files...');
  const filesToRemove = [
    'zk/ageCheck.r1cs',
    'zk/ageCheck.wasm',
    'zk/ageCheck.sym',
    'zk/ageCheck_0000.zkey',
    'zk/ageCheck_final.zkey',
    'zk/verification_key.json'
  ];
  
  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`   Removed ${file}`);
    }
  });
  console.log('✅ Cleanup completed');
  
  console.log('\n🎉 ZK circuit compilation completed successfully!');
  console.log('📄 AgeVerifier.sol has been generated in contracts/');
  
} catch (error) {
  console.error('❌ Failed to compile ZK circuit:', error.message);
  process.exit(1);
} 