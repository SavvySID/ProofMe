#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up ProofMe - Zero-Knowledge Credential Verification');
console.log('=============================================================\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created. Please update it with your configuration.');
  } else {
    console.log('⚠️  env.example not found. Please create a .env file manually.');
  }
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies:', error.message);
  process.exit(1);
}

// Check if Circom is installed
console.log('\n🔍 Checking Circom installation...');
try {
  execSync('circom --version', { stdio: 'pipe' });
  console.log('✅ Circom is installed');
} catch (error) {
  console.log('⚠️  Circom not found. Please install it:');
  console.log('   npm install -g circom');
  console.log('   Or visit: https://docs.circom.io/getting-started/installation/');
  console.log('   Skipping ZK circuit compilation...');
}

// Check if SnarkJS is installed
console.log('\n🔍 Checking SnarkJS installation...');
try {
  execSync('snarkjs --version', { stdio: 'pipe' });
  console.log('✅ SnarkJS is installed');
} catch (error) {
  console.log('⚠️  SnarkJS not found. Please install it:');
  console.log('   npm install -g snarkjs');
  console.log('   Skipping ZK circuit compilation...');
}

// Compile ZK circuit and generate verifier
console.log('\n🔐 Compiling ZK circuit and generating verifier...');
try {
  // Check if circuit file exists
  if (!fs.existsSync('zk/ageCheck.circom')) {
    console.log('⚠️  Circuit file not found. Skipping ZK compilation...');
  } else {
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
  }
} catch (error) {
  console.error('❌ Failed to compile ZK circuit:', error.message);
  console.log('⚠️  Continuing with setup...');
}

// Compile contracts
console.log('\n🔨 Compiling smart contracts...');
try {
  execSync('npx hardhat compile', { stdio: 'inherit' });
  console.log('✅ Contracts compiled');
} catch (error) {
  console.error('❌ Failed to compile contracts:', error.message);
  console.log('💡 If this fails, make sure you have installed Circom and SnarkJS:');
  console.log('   npm install -g circom snarkjs');
  console.log('   Then run: node scripts/setup.js');
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with your private key and contract addresses');
console.log('2. Deploy contracts: npm run deploy:citrea');
console.log('3. Start the frontend: npm run dev');
console.log('4. Visit http://localhost:3000 to use the application');
console.log('\n📚 Documentation:');
console.log('- Citrea docs: https://docs.citrea.xyz/');
console.log('- Circom docs: https://docs.circom.io/');
console.log('- SnarkJS docs: https://github.com/iden3/snarkjs'); 