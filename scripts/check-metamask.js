#!/usr/bin/env node

console.log('🔍 Checking MetaMask Availability...');
console.log('===================================\n');

console.log('📋 Steps to check MetaMask:');
console.log('1. Open your browser');
console.log('2. Check if MetaMask extension is installed');
console.log('3. Make sure MetaMask is unlocked');
console.log('4. Check if MetaMask is connected to localhost:8545');

console.log('\n🎯 MetaMask Setup for Local Testing:');
console.log('1. Install MetaMask extension if not already installed');
console.log('2. Open MetaMask and unlock it');
console.log('3. Add localhost network:');
console.log('   - Network Name: Localhost 8545');
console.log('   - RPC URL: http://127.0.0.1:8545');
console.log('   - Chain ID: 1337');
console.log('   - Currency: ETH');

console.log('\n💡 Quick Test:');
console.log('1. Open http://localhost:3000');
console.log('2. Click "Connect MetaMask" button');
console.log('3. MetaMask should pop up asking for connection');
console.log('4. Approve the connection');

console.log('\n🔧 If MetaMask doesn\'t show up:');
console.log('- Make sure MetaMask extension is installed');
console.log('- Check if MetaMask is unlocked');
console.log('- Try refreshing the page');
console.log('- Check browser console for errors (F12)');

console.log('\n✅ Expected behavior:');
console.log('- MetaMask popup appears when clicking connect');
console.log('- After approval, wallet address shows in navbar');
console.log('- "Connect Wallet" button changes to show address'); 