# Environment Variables for Vercel Deployment

## Required Environment Variables

Set these in your Vercel project settings:

### 1. WalletConnect Project ID
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Important**: Replace `your_project_id_here` with your actual WalletConnect project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

### 2. Optional Network Configuration
```
VITE_CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
VITE_LOCALHOST_RPC_URL=http://127.0.0.1:8545
```

## How to Set in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the exact names above
4. Redeploy your project

## Current Hardcoded Values

The project currently has these hardcoded values that should be moved to environment variables:
- WalletConnect Project ID: `c4f79cc821944d9680842e34466bfbd9` (temporary test ID)
