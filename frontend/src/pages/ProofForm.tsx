import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ProofForm: React.FC = () => {
  const navigate = useNavigate()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [birthYear, setBirthYear] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proof, setProof] = useState('')
  const [error, setError] = useState('')

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
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!birthYear || birthYear.length !== 4) {
      setError('Please enter a valid 4-digit birth year')
      return
    }

    const currentYear = new Date().getFullYear()
    const age = currentYear - parseInt(birthYear)
    
    if (age < 18) {
      setError('You must be at least 18 years old to use this service')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Simulate proof generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate a mock proof (in real implementation, this would use ZK circuits)
      const mockProof = `proof_${Date.now()}_${address.slice(2, 8)}`
      setProof(mockProof)
      
      // Navigate to status page
      navigate('/status', { state: { proof: mockProof, birthYear } })
    } catch (err) {
      setError('Failed to generate proof. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to verify your age.
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
        <h2 className="text-2xl font-bold mb-6">Age Verification</h2>
        <p className="text-gray-600 mb-6">
          Prove you are over 18 without revealing your exact birth date.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
              Birth Year
            </label>
            <input
              type="number"
              id="birthYear"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="1990"
              min="1900"
              max={new Date().getFullYear()}
              className="input-field"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              This information is only used locally to generate your proof and is never stored.
            </p>
          </div>

          {error && (
            <div className="status-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Generating Proof...' : 'Generate Age Proof'}
          </button>
        </form>

        {proof && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Proof Generated!</h3>
            <p className="text-sm text-green-700">
              Your age verification proof has been created successfully.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProofForm 