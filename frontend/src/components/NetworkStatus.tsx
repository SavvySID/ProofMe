import React from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NetworkStatusProps {
  className?: string
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className = '' }) => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork()

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
      if (switchNetwork) {
        await switchNetwork(5115) // Switch to Citrea Testnet
      }
    } catch (err) {
      console.error('Failed to switch network:', err)
    }
  }

  if (!isConnected) {
    return null
  }

  const networkStatus = getNetworkStatus(chain?.id || null)

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Network Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          networkStatus.color === 'green' 
            ? 'bg-green-500 animate-pulse' 
            : networkStatus.color === 'yellow'
            ? 'bg-yellow-500 animate-pulse-slow'
            : 'bg-red-500 animate-pulse'
        }`}></div>
      </div>
      
      {/* Switch Network Button */}
      {networkStatus.status === 'wrong' && (
        <Button
          onClick={handleSwitchNetwork}
          variant="link"
          size="sm"
          className="text-blue-600 hover:text-blue-800 underline transition-colors hover:no-underline hover:bg-gradient-to-r hover:from-slate-50/50 hover:via-blue-50/50 px-2 py-1 rounded-md p-0 h-auto"
        >
          Switch to Citrea Testnet
        </Button>
      )}
    </div>
  )
}

export default NetworkStatus 