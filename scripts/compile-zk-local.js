#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔐 Compiling ZK Circuit for ProofMe (Local Installation)');
console.log('========================================================\n');

// Check if circuit file exists
if (!fs.existsSync('zk/ageCheck.circom')) {
  console.error('❌ Circuit file zk/ageCheck.circom not found!');
  process.exit(1);
}

// Check if SnarkJS is available locally
console.log('🔍 Checking SnarkJS installation...');
try {
  require('snarkjs');
  console.log('✅ SnarkJS found in node_modules');
} catch (error) {
  console.error('❌ SnarkJS not found in node_modules. Installing...');
  try {
    execSync('npm install snarkjs', { stdio: 'inherit' });
    console.log('✅ SnarkJS installed');
  } catch (installError) {
    console.error('❌ Failed to install SnarkJS:', installError.message);
    process.exit(1);
  }
}

// Check if Circom is available
console.log('🔍 Checking Circom installation...');
try {
  require('circom');
  console.log('✅ Circom found in node_modules');
} catch (error) {
  console.error('❌ Circom not found in node_modules. Installing...');
  try {
    execSync('npm install circom', { stdio: 'inherit' });
    console.log('✅ Circom installed');
  } catch (installError) {
    console.error('❌ Failed to install Circom:', installError.message);
    process.exit(1);
  }
}

// Check if powersOfTau file exists
const powersOfTauPath = 'node_modules/circomlib/powersOfTau28_hez_final_10.ptau';
if (!fs.existsSync(powersOfTauPath)) {
  console.log('📥 Downloading powersOfTau file...');
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(powersOfTauPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Download using node-fetch or curl equivalent
    const https = require('https');
    const file = fs.createWriteStream(powersOfTauPath);
    const url = 'https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau';
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ powersOfTau file downloaded');
      });
    }).on('error', (err) => {
      fs.unlink(powersOfTauPath, () => {}); // Delete the file async
      console.error('❌ Failed to download powersOfTau file:', err.message);
      console.log('💡 Please download manually from:');
      console.log('   https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau');
      console.log('   And place it in: node_modules/circomlib/');
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to download powersOfTau file:', error.message);
    process.exit(1);
  }
}

try {
  // Use local installations instead of global commands
  console.log('📝 Compiling ageCheck circuit...');
  execSync('node node_modules/.bin/circom zk/ageCheck.circom --r1cs --wasm --sym', { stdio: 'inherit' });
  console.log('✅ Circuit compiled');
  
  // Generate proving key
  console.log('🔑 Generating proving key...');
  execSync('node node_modules/.bin/snarkjs groth16 setup zk/ageCheck.r1cs node_modules/circomlib/powersOfTau28_hez_final_10.ptau zk/ageCheck_0000.zkey', { stdio: 'inherit' });
  console.log('✅ Proving key generated');
  
  // Contribute to phase 2 of the ceremony
  console.log('🎭 Contributing to phase 2...');
  execSync('node node_modules/.bin/snarkjs zkey contribute zk/ageCheck_0000.zkey zk/ageCheck_final.zkey', { stdio: 'inherit' });
  console.log('✅ Phase 2 contribution completed');
  
  // Export verification key
  console.log('🔍 Exporting verification key...');
  execSync('node node_modules/.bin/snarkjs zkey export verificationkey zk/ageCheck_final.zkey zk/verification_key.json', { stdio: 'inherit' });
  console.log('✅ Verification key exported');
  
  // Generate Solidity verifier
  console.log('📄 Generating Solidity verifier...');
  execSync('node node_modules/.bin/snarkjs zkey export solidityverifier zk/ageCheck_final.zkey contracts/AgeVerifier.sol', { stdio: 'inherit' });
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
  console.log('\n💡 Troubleshooting:');
  console.log('1. Make sure you have enough disk space');
  console.log('2. Check that all dependencies are installed: npm install');
  console.log('3. Try running: node scripts/verify-contracts.js');
  process.exit(1);
} 