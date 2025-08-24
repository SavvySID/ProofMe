# 🚀 Deploy ProofMe to Vercel

Your ProofMe frontend is now **deploy-ready** for Vercel! Here's everything you need to know:

## ✅ **What's Ready**
- ✅ Builds successfully with `npm run build`
- ✅ Vercel configuration (`vercel.json`) created
- ✅ Environment variables configured
- ✅ React Router properly configured for SPA
- ✅ All dependencies properly installed

## 🚀 **Deployment Steps**

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. **Connect to Vercel**
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as the root directory

### 3. **Configure Build Settings**
Vercel should auto-detect these, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. **Set Environment Variables**
In your Vercel project settings, add:

#### Required:
```
VITE_WALLETCONNECT_PROJECT_ID=your_actual_project_id
```

#### Optional:
```
VITE_CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
VITE_LOCALHOST_RPC_URL=http://127.0.0.1:8545
```

**Important**: Get your WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

### 5. **Deploy**
Click "Deploy" and wait for the build to complete!

## 🔧 **Post-Deployment**

### **Custom Domain** (Optional)
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain

### **Environment Variables for Different Branches**
- Set `VITE_WALLETCONNECT_PROJECT_ID` for all environments
- You can have different values for Preview/Production if needed

## 🐛 **Troubleshooting**

### **Build Fails**
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses 18.x by default)

### **WalletConnect Not Working**
- Verify `VITE_WALLETCONNECT_PROJECT_ID` is set correctly
- Check that the project ID is active in WalletConnect Cloud

### **Routing Issues**
- The `vercel.json` should handle React Router properly
- If issues persist, check that the rewrite rule is working

## 📱 **Testing Your Deployment**

1. **Wallet Connection**: Test MetaMask and other wallet connections
2. **Navigation**: Verify all routes work (`/`, `/proof`, `/status`)
3. **Contract Interaction**: Test with your deployed contracts
4. **Mobile**: Test responsive design on mobile devices

## 🎯 **Performance Notes**

Your build shows some large chunks (>500KB). This is normal for crypto/web3 apps, but you can optimize later:
- Use dynamic imports for heavy components
- Implement code splitting for better performance
- Consider lazy loading for non-critical features

## 🚀 **You're Ready to Deploy!**

Your ProofMe frontend is fully configured for Vercel deployment. The build is successful, routing is configured, and environment variables are set up. Just follow the steps above and you'll have a live, production-ready dApp!
