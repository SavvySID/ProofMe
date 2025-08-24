import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { 
  RainbowKitProvider, 
  getDefaultWallets,
  connectorsForWallets,
  darkTheme,
  lightTheme
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'
import App from './App'

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    {
      id: 5115,
      name: 'Citrea Testnet',
      network: 'citrea-testnet',
      nativeCurrency: {
        name: 'cBTC',
        symbol: 'cBTC',
        decimals: 18,
      },
      rpcUrls: {
        default: { http: ['https://rpc.testnet.citrea.xyz'] },
        public: { http: ['https://rpc.testnet.citrea.xyz'] },
      },
      blockExplorers: {
        default: { name: 'Citrea Explorer', url: 'https://explorer.testnet.citrea.xyz' },
      },
    },
    {
      id: 1337,
      name: 'Localhost',
      network: 'localhost',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
        public: { http: ['http://127.0.0.1:8545'] },
      },
    },
  ],
  [publicProvider()]
)

// Set up wallets with explicit injected wallet support
const { wallets } = getDefaultWallets({
  appName: 'ProofMe',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9',
  chains,
})

// Add explicit injected wallet support for better MetaMask compatibility
import { 
  injectedWallet, 
  metaMaskWallet, 
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet
} from '@rainbow-me/rainbowkit/wallets'

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains, projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9' }),
      coinbaseWallet({ chains, appName: 'ProofMe' }),
      rainbowWallet({ chains, projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9' }),
      walletConnectWallet({ chains, projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9' }),
    ],
  },
])

// Set up wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={{
          lightMode: lightTheme({
            accentColor: '#ffffff',
            accentColorForeground: '#374151',
            borderRadius: 'medium',
            fontStack: 'system',
          }),
          darkMode: lightTheme({
            accentColor: '#ffffff',
            accentColorForeground: '#374151',
            borderRadius: 'medium',
            fontStack: 'system',
          }),
        }}
        appInfo={{
          appName: 'ProofMe',
          learnMoreUrl: 'https://proofme.com',
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
) 