import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ProofStatus: React.FC = () => {
  const location = useLocation()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [proofData, setProofData] = useState<any>(null)

  useEffect(() => {
    // Check if wallet is connected
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

    // Get proof data from navigation state
    if (location.state?.proof) {
      setProofData({
        proof: location.state.proof,
        birthYear: location.state.birthYear,
        timestamp: new Date().toISOString()
      })
    }
  }, [location.state])

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to view your proof status.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Proof Status</h2>
        
        {proofData ? (
          <div className="space-y-6">
            <div className="status-success">
              <h3 className="font-semibold text-green-800 mb-2">✅ Proof Verified</h3>
              <p className="text-green-700">
                Your age verification proof has been successfully generated and verified.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Proof Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Proof ID:</span>
                  <span className="font-mono">{proofData.proof}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Birth Year:</span>
                  <span>{proofData.birthYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated:</span>
                  <span>{new Date(proofData.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet Address:</span>
                  <span className="font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">What This Means</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You have successfully proven you are over 18 years old</li>
                <li>• Your actual birth date remains private and secure</li>
                <li>• This proof can be used across multiple platforms</li>
                <li>• The verification is cryptographically secure</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => window.print()}
                className="btn-secondary"
              >
                Download Proof
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn-primary"
              >
                Generate New Proof
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Proof Found</h3>
            <p className="text-gray-600 mb-6">
              You haven't generated any age verification proofs yet.
            </p>
            <button 
              onClick={() => window.location.href = '/verify'}
              className="btn-primary"
            >
              Generate Your First Proof
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProofStatus 