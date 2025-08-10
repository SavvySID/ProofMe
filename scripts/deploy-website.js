#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ProofMe Website Deployment Script');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('frontend/package.json')) {
  console.error('❌ Error: Please run this script from the root directory');
  process.exit(1);
}

// Function to run commands
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`Running: ${command}`);
  
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
  return true;
}

// Function to check if command exists
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Main deployment function
async function deployWebsite() {
  console.log('🔍 Checking prerequisites...');
  
  // Check if frontend dependencies are installed
  if (!fs.existsSync('frontend/node_modules')) {
    console.log('📦 Installing frontend dependencies...');
    if (!runCommand('cd frontend && npm install', 'Installing frontend dependencies')) {
      return;
    }
  }
  
  // Build the project
  console.log('\n🏗️ Building the project...');
  if (!runCommand('cd frontend && npm run build', 'Building frontend')) {
    return;
  }
  
  // Check deployment options
  console.log('\n🌐 Deployment Options:');
  console.log('1. Vercel (Recommended - Free)');
  console.log('2. Netlify (Free)');
  console.log('3. GitHub Pages (Free)');
  console.log('4. Manual deployment');
  
  // Check which deployment tools are available
  const hasVercel = commandExists('vercel');
  const hasNetlify = commandExists('netlify');
  
  if (hasVercel) {
    console.log('\n✅ Vercel CLI detected');
    console.log('🚀 Deploying to Vercel...');
    
    if (runCommand('cd frontend && vercel --prod --yes', 'Deploying to Vercel')) {
      console.log('\n🎉 Website deployed to Vercel!');
      console.log('📱 Your website is now accessible to anyone');
      console.log('🔗 Check your Vercel dashboard for the URL');
    }
  } else if (hasNetlify) {
    console.log('\n✅ Netlify CLI detected');
    console.log('🚀 Deploying to Netlify...');
    
    if (runCommand('cd frontend && netlify deploy --prod --dir=dist', 'Deploying to Netlify')) {
      console.log('\n🎉 Website deployed to Netlify!');
      console.log('📱 Your website is now accessible to anyone');
      console.log('🔗 Check your Netlify dashboard for the URL');
    }
  } else {
    console.log('\n📋 Manual Deployment Instructions:');
    console.log('1. The built files are in: frontend/dist/');
    console.log('2. Upload these files to your hosting provider');
    console.log('3. Configure your domain and SSL certificate');
    console.log('\n💡 Recommended hosting providers:');
    console.log('   - Vercel (vercel.com)');
    console.log('   - Netlify (netlify.com)');
    console.log('   - AWS S3 + CloudFront');
    console.log('   - Google Cloud Storage');
  }
  
  // Show next steps
  console.log('\n📚 Next Steps:');
  console.log('1. Deploy smart contracts to mainnet');
  console.log('2. Update environment variables with mainnet addresses');
  console.log('3. Test the website thoroughly');
  console.log('4. Set up monitoring and analytics');
  console.log('5. Market your privacy-preserving solution!');
}

// Run deployment
deployWebsite().catch(console.error);

