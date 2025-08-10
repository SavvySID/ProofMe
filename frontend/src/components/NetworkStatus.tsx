import React from 'react'
import { useWallet } from '../hooks/useWallet'

interface NetworkStatusProps {
  className?: string
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className = '' }) => {
  const { walletState, switchToCitreaTestnet } = useWallet()

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 5115:
        return 'Citrea Testnet'
      case 1337:
        return 'Localhost'
      default:
        return 'Unknown Network'
    }
  }

  const getNetworkStatus = (chainId: number | null) => {
    switch (chainId) {
      case 5115:
        return { status: 'connected', color: 'green', text: 'Connected to Citrea Testnet' }
      case 1337:
        return { status: 'local', color: 'yellow', text: 'Connected to Localhost' }
      default:
        return { status: 'wrong', color: 'red', text: 'Wrong Network' }
    }
  }

  const handleSwitchNetwork = async () => {
    try {
      await switchToCitreaTestnet()
    } catch (err) {
      console.error('Failed to switch network:', err)
    }
  }

  if (!walletState.isConnected) {
    return null
  }

  const networkStatus = getNetworkStatus(walletState.chainId)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        networkStatus.color === 'green' 
          ? 'bg-green-100 text-green-800' 
          : networkStatus.color === 'yellow'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {getNetworkName(walletState.chainId)}
      </span>
      
      {networkStatus.status === 'wrong' && (
        <button
          onClick={handleSwitchNetwork}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Switch to Citrea Testnet
        </button>
      )}
    </div>
  )
}

export default NetworkStatus 