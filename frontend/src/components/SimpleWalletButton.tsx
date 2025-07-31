import React, { useState, useEffect } from 'react'

const SimpleWalletButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if already connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setIsConnected(true)
            setAddress(accounts[0])
          }
        })
        .catch(console.error)
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask!')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      if (accounts.length > 0) {
        setIsConnected(true)
        setAddress(accounts[0])
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      alert('Failed to connect to MetaMask')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress('')
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnectWallet}
          className="btn-secondary text-sm"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="btn-primary"
    >
      {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
    </button>
  )
}

export default SimpleWalletButton 