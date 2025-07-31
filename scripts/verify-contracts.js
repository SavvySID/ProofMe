#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying ProofMe contracts...');
console.log('================================\n');

// Check if contracts exist and are valid
const contractsDir = './contracts';
const contracts = fs.readdirSync(contractsDir).filter(file => file.endsWith('.sol'));

console.log(`📄 Found ${contracts.length} contract(s):`);

let allValid = true;

contracts.forEach(contract => {
  console.log(`\n🔍 Checking ${contract}...`);
  const contractPath = path.join(contractsDir, contract);
  const content = fs.readFileSync(contractPath, 'utf8');
  
  // Check for required elements
  const checks = [
    { name: 'pragma solidity', pattern: /pragma solidity/, required: true },
    { name: 'contract definition', pattern: /contract\s+\w+/, required: true },
    { name: 'SPDX license', pattern: /SPDX-License-Identifier/, required: true },
    { name: 'import statements', pattern: /import/, required: false },
    { name: 'function definitions', pattern: /function/, required: false },
    { name: 'struct definitions', pattern: /struct/, required: false },
    { name: 'event definitions', pattern: /event/, required: false }
  ];
  
  checks.forEach(check => {
    const hasPattern = check.pattern.test(content);
    const status = hasPattern ? '✅' : (check.required ? '❌' : '⚠️');
    console.log(`   ${status} ${check.name}`);
    
    if (check.required && !hasPattern) {
      allValid = false;
    }
  });
  
  // Check for common Solidity syntax issues
  const syntaxChecks = [
    { name: 'balanced braces', check: () => {
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      return openBraces === closeBraces;
    }},
    { name: 'balanced parentheses', check: () => {
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      return openParens === closeParens;
    }},
    { name: 'semicolons after statements', check: () => {
      // Basic check for semicolons after common statements
      const statements = content.match(/function\s+\w+[^;]*;/g);
      return statements && statements.length > 0;
    }}
  ];
  
  syntaxChecks.forEach(syntaxCheck => {
    const isValid = syntaxCheck.check();
    const status = isValid ? '✅' : '⚠️';
    console.log(`   ${status} ${syntaxCheck.name}`);
    
    if (!isValid) {
      allValid = false;
    }
  });
});

console.log('\n' + '='.repeat(50));

if (allValid) {
  console.log('🎉 All contracts passed verification!');
  console.log('\n📋 Next steps:');
  console.log('1. Install Circom and SnarkJS for ZK circuit compilation:');
  console.log('   npm install -g circom snarkjs');
  console.log('2. Generate the actual AgeVerifier contract:');
  console.log('   node scripts/compile-zk.js');
  console.log('3. Deploy contracts to Citrea testnet:');
  console.log('   npm run deploy:citrea');
  console.log('4. Start the frontend:');
  console.log('   npm run dev');
} else {
  console.log('❌ Some contracts have issues that need to be fixed.');
  console.log('💡 Check the warnings above and fix any syntax errors.');
}

console.log('\n📚 Documentation:');
console.log('- Solidity docs: https://docs.soliditylang.org/');
console.log('- Hardhat docs: https://hardhat.org/docs/');
console.log('- Citrea docs: https://docs.citrea.xyz/'); 