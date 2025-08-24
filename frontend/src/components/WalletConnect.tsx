import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface WalletConnectProps {
  onWalletConnected?: (address: string, chainId: number) => void
  verificationStatus?: {
    verified: boolean
    timestamp: number
  }
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  onWalletConnected, 
  verificationStatus 
}) => {
  const { address, isConnected } = useAccount()
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

  const handleSwitchToCitrea = () => {
    if (switchNetwork) {
      switchNetwork(5115)
    }
  }

  // Notify parent component when wallet connects
  React.useEffect(() => {
    console.log('Wallet state changed:', { isConnected, address, chainId: chain?.id })
    if (isConnected && address && chain && onWalletConnected) {
      onWalletConnected(address, chain.id)
    }
  }, [isConnected, address, chain, onWalletConnected])

  if (isConnected && address) {
    return (
      <div className="space-y-4">
        {/* Wallet Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Wallet</h3>
          <div className="space-y-3">
            <p className="text-gray-600 font-mono text-lg">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            
            {/* Network Info */}
            <div className="flex items-center space-x-3">
              <Badge variant={
                chain?.id === 5115 
                  ? 'default' 
                  : chain?.id === 1337
                  ? 'secondary'
                  : 'destructive'
              }>
                {getNetworkName(chain?.id || null)}
              </Badge>
              
              {/* Show switch network button if not on Citrea testnet */}
              {chain?.id !== 5115 && chain?.id !== 1337 && (
                <Button
                  onClick={handleSwitchToCitrea}
                  disabled={isSwitching}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 hover:text-blue-800 border-blue-200 hover:border-blue-300"
                >
                  {isSwitching ? 'Switching...' : 'Switch to Citrea Testnet'}
                </Button>
              )}
            </div>

            {/* Verification Status */}
            {verificationStatus?.verified && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  ✅ Age Verified
                </Badge>
                <p className="text-sm text-gray-500">
                  Verified on {new Date(verificationStatus.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Network Warning */}
            {chain?.id !== 5115 && chain?.id !== 1337 && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Unsupported Network</p>
                  <p>Please switch to Citrea Testnet (Chain ID: 5115) or Localhost (Chain ID: 1337) for the best experience.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disconnect Button */}
        <div className="text-center">
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="text-center">
      <ConnectButton />
    </div>
  )
}

export default WalletConnect
