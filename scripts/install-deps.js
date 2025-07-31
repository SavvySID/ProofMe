#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('📦 Installing missing dependencies...');

const dependencies = [
  'dotenv',
  'snarkjs',
  'circomlibjs'
];

dependencies.forEach(dep => {
  console.log(`\n🔍 Checking ${dep}...`);
  try {
    require(dep);
    console.log(`✅ ${dep} is already installed`);
  } catch (error) {
    console.log(`📥 Installing ${dep}...`);
    try {
      execSync(`npm install ${dep}`, { stdio: 'inherit' });
      console.log(`✅ ${dep} installed successfully`);
    } catch (installError) {
      console.error(`❌ Failed to install ${dep}:`, installError.message);
    }
  }
});

console.log('\n🎉 Dependency installation completed!');
console.log('\n💡 You can now try:');
console.log('   npm run deploy:citrea'); 