import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if wallet is connected
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          setIsConnected(accounts.length > 0)
        })
        .catch(console.error)
    }
  }, [])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Privacy-First Credential Verification
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Prove your age, qualifications, or identity attributes without revealing any personal data. 
          Built on Bitcoin using Citrea zkEVM for maximum security and privacy.
        </p>
        <div className="flex justify-center space-x-4">
          {isConnected ? (
            <Link 
              to="/verify" 
              className="btn-primary text-lg px-8 py-3"
            >
              Start Verification
            </Link>
          ) : (
            <div className="text-gray-500 text-lg">
              Connect your wallet to get started
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 py-16">
        <div className="card text-center">
          <div className="w-12 h-12 bg-citrea-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-citrea-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Zero-Knowledge Proofs</h3>
          <p className="text-gray-600">
            Prove facts like "I'm over 18" without revealing your actual birth date or any personal information.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-citrea-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-citrea-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Bitcoin Security</h3>
          <p className="text-gray-600">
            Built on Citrea zkEVM, leveraging Bitcoin's security with EVM compatibility for smart contracts.
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-citrea-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-citrea-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Reusable Credentials</h3>
          <p className="text-gray-600">
            Once verified, your proof can be used across multiple platforms without re-verification.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-citrea-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Input Your Data</h3>
            <p className="text-gray-600">Enter your birth year (only you see this)</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-citrea-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Generate Proof</h3>
            <p className="text-gray-600">Our ZK circuit creates a mathematical proof</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-citrea-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Submit to Blockchain</h3>
            <p className="text-gray-600">Proof is verified on Citrea zkEVM</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-citrea-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              4
            </div>
            <h3 className="text-lg font-semibold mb-2">Use Your Proof</h3>
            <p className="text-gray-600">Present your verified credential anywhere</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-citrea-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">
          Join the future of privacy-preserving digital identity verification.
        </p>
        <Link 
          to="/verify" 
          className="btn-primary text-lg px-8 py-3"
        >
          Verify Your Age Now
        </Link>
      </div>
    </div>
  )
}

export default Home 