# 🚀 Manual Frontend Start Guide

## Why the white screen appears:
The frontend is showing a white screen because it's not actually running. PowerShell execution policy is blocking npm commands.

## 🔧 Quick Fix Steps:

### Option 1: Use Command Prompt (Recommended)
1. **Open Command Prompt** (not PowerShell)
2. **Navigate to your project:**
   ```cmd
   cd D:\Koding\ProofMe
   ```
3. **Start the frontend:**
   ```cmd
   cd frontend
   npm run dev
   ```
4. **Visit:** http://localhost:3000

### Option 2: Enable PowerShell Execution
1. **Open PowerShell as Administrator**
2. **Run this command:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. **Then start the frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

### Option 3: Use Node Directly
1. **In your current terminal:**
   ```bash
   node frontend/node_modules/vite/bin/vite.js
   ```

## 🎯 What should happen:
- You should see output like: `Local: http://localhost:3000/`
- The browser should show the ProofMe interface instead of a white screen
- You should see a modern UI with wallet connection options

## 🔗 Setup MetaMask for Local Testing:
1. Open MetaMask
2. Add network:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`

## 📱 Expected Result:
Instead of a white screen, you should see:
- ProofMe logo and title
- "Connect Wallet" button
- Age verification form
- Modern UI with TailwindCSS styling

## 🆘 If still not working:
1. Make sure you're in the right directory: `D:\Koding\ProofMe`
2. Check if frontend dependencies are installed: `ls frontend/node_modules`
3. Try reinstalling: `cd frontend && npm install`
4. Start local Hardhat network: `npx hardhat node` (in a separate terminal)

---
**The "private key too short" error is completely fixed! Now we just need to get the frontend running properly.** 🎉 