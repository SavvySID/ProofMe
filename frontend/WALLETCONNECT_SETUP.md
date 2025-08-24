# WalletConnect Setup Guide

## Getting Your Project ID

To use WalletConnect with RainbowKit, you need to get a project ID from WalletConnect Cloud:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Replace `YOUR_PROJECT_ID` in `src/main.tsx` with your actual Project ID

## Current Configuration

Your app is now configured with:

- **RainbowKit**: Provides a beautiful wallet connection interface
- **Wagmi**: Handles wallet state management
- **Supported Networks**: 
  - Citrea Testnet (Chain ID: 5115)
  - Localhost (Chain ID: 1337)

## Features

✅ **Wallet Selection**: Users can now choose which wallet to connect (MetaMask, Rainbow, WalletConnect, etc.)
✅ **Network Switching**: Built-in network switching support
✅ **Beautiful UI**: Modern, responsive wallet connection interface
✅ **Auto-connect**: Remembers user's wallet connection

## What Changed

- Replaced the old `useWallet` hook with RainbowKit + Wagmi
- Added proper wallet selection interface
- Improved network switching UX
- Better error handling and user feedback

## Next Steps

1. Get your WalletConnect Project ID
2. Update `src/main.tsx` with your Project ID
3. Test the wallet connection flow
4. The app will now show a proper wallet selection modal instead of auto-connecting

## Testing

1. Open your browser to `http://localhost:3000`
2. Click "Connect Wallet to Start"
3. You should see a beautiful wallet selection modal
4. Choose your preferred wallet
5. Approve the connection in your wallet
6. The app will connect and show your wallet status
