import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { ZKProof } from '../utils/zkProof'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Info, 
  Shield, 
  Zap, 
  RefreshCw, 
  Scale, 
  Home, 
  Lock,
  HelpCircle,
  AlertTriangle
} from 'lucide-react'
import WalletConnect from '../components/WalletConnect'
import { useWallet } from '../hooks/useWallet'
import { generateZKProof } from '../utils/zkProof'
import { deploymentChecker } from '../utils/deploymentChecker'

const ProofForm: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { switchNetwork, isLoading: isSwitching } = useSwitchNetwork()
  
  // Use the wallet hook for proper proof generation
  const { 
    generateAndSubmitProof, 
    verificationStatus, 
    isLoading: isWalletLoading, 
    error: walletError,
    currentTransaction
  } = useWallet()
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [birthYear, setBirthYear] = useState('')
  const [proof, setProof] = useState<ZKProof | null>(null)
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [areContractsDeployed, setAreContractsDeployed] = useState(false)

  // Check contract deployment status when chain changes
  useEffect(() => {
    const checkContracts = async () => {
      if (chain?.id) {
        try {
          const status = await deploymentChecker.checkDeployment(chain.id)
          setAreContractsDeployed(status.overall)
        } catch (error) {
          console.error('Error checking contract deployment:', error)
          setAreContractsDeployed(false)
        }
      }
    }

    checkContracts()
  }, [chain?.id])

  // Clear error state when transaction succeeds
  useEffect(() => {
    if (currentTransaction?.status === 'confirmed' && successMessage) {
      setLocalError('')
      setError(null)
    }
  }, [currentTransaction?.status, successMessage])

  // Navigate to status page when transaction hash becomes available
  useEffect(() => {
    if (currentTransaction?.hash && successMessage && successMessage.includes('Waiting for transaction hash')) {
      const proofId = 'ZK_' + Date.now().toString(36)
      const navigationState = {
        proof: proof,
        birthYear,
        timestamp: new Date().toISOString(),
        verified: false,
        transactionHash: currentTransaction.hash,
        proofId: proofId
      }
      
      console.log('🚀 Transaction hash available, navigating to ProofStatus with state:', navigationState)
      
      // Navigate immediately when transaction hash is available
      navigate('/status', { state: navigationState })
    }
  }, [currentTransaction?.hash, successMessage, proof, birthYear, navigate])

  // Debug and clean up function errors
  useEffect(() => {
    console.log('🔍 Debug - Error states:', {
      error: { value: error, type: typeof error },
      localError: { value: localError, type: typeof localError },
      walletError: { value: walletError, type: typeof walletError }
    })
    
    if (typeof error === 'function') {
      console.error('⚠️ Function detected in error state, clearing...')
      setError(null)
    }
    if (typeof localError === 'function') {
      console.error('⚠️ Function detected in localError state, clearing...')
      setLocalError('')
    }
    if (typeof walletError === 'function') {
      console.error('⚠️ Function detected in walletError state, clearing...')
      // We can't directly set walletError, but we can log it
    }
  }, [error, localError, walletError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      setLocalError('Please connect your wallet first')
      return
    }

    if (!birthYear || birthYear.length !== 4) {
      setLocalError('Please enter a valid 4-digit birth year')
      return
    }

    const currentYear = new Date().getFullYear()
    const age = currentYear - parseInt(birthYear)
    
    if (age < 18) {
      setLocalError('You must be at least 18 years old to use this service')
      return
    }

    setLocalError('')
    setIsLoading(true)

    try {
      // First try to generate proof locally
      const currentYear = new Date().getFullYear()
      console.log('🔐 Starting proof generation for birth year:', birthYear, 'current year:', currentYear)
      
      const zkProof = await generateZKProof({ birthYear: parseInt(birthYear), currentYear })
      console.log('🔐 Proof generation result:', zkProof)
      
      if (zkProof) {
        setProof(zkProof)
        setSuccessMessage('Proof generated successfully! Review the proof details below, then submit to blockchain.')
        console.log('✅ Proof set in state, showing success message')
        
        // Don't auto-submit to blockchain - let user review first
        return
      } else {
        throw new Error('Failed to generate proof locally')
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to generate proof')
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSwitchNetwork = async () => {
    try {
      console.log('Switching to Citrea testnet from ProofForm component...')
      if (switchNetwork) {
        await switchNetwork(5115) // Switch to Citrea Testnet
      }
    } catch (err) {
      console.error('Failed to switch network:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setLocalError(`Failed to switch to Citrea testnet: ${errorMessage}. Please switch to Citrea Testnet (Chain ID: 5115) manually in MetaMask.`)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
                Age Verification with Zero-Knowledge Proofs
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Prove you're over 18 without revealing your exact birth date or any personal information. 
                Your privacy is protected by advanced cryptography on the Bitcoin blockchain.
              </p>
            </div>

            {/* Main Connect Wallet Card */}
            <Card className="text-center backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] mb-12">
              <CardHeader>
                <CardTitle className="text-3xl md:text-4xl bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Connect Your Wallet
                </CardTitle>
                <CardDescription className="text-lg text-gray-700">
                  Start your privacy-first age verification journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <WalletConnect 
                    onWalletConnected={(address, chainId) => {
                      console.log('Wallet connected:', address, chainId)
                    }}
                    verificationStatus={verificationStatus}
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="mt-6 backdrop-blur-sm border-red-200/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* How It Works Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="backdrop-blur-md border-white/20 hover:shadow-xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Verification Process</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4 text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</span>
                      <span>Input your birth year securely in your browser</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</span>
                      <span>Our system generates a mathematical proof locally</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</span>
                      <span>The proof is cryptographically signed and verified</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">4</span>
                      <span>Your verification status is recorded on-chain</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md border-white/20 hover:shadow-xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-green-500" />
                    <span>Use Cases</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-gray-700">
                    <div className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">•</span>
                      <span>Age-restricted content access (18+ websites, apps)</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">•</span>
                      <span>DeFi protocol age requirements</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">•</span>
                      <span>NFT marketplace age verification</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-500 mr-3 mt-1">•</span>
                      <span>Gaming platform age restrictions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Section */}
            <Card className="backdrop-blur-md border-white/20 hover:shadow-xl transition-all duration-500 mb-12">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900 mb-4">Privacy & Security Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-3 flex justify-center">
                      <Lock className="h-12 w-12 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Computation</h3>
                    <p className="text-gray-600 text-sm">
                      All cryptographic operations happen in your browser. Your data never leaves your device.
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl mb-3 flex justify-center">
                      <Shield className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Mathematical Guarantees</h3>
                    <p className="text-gray-600 text-sm">
                      Zero-knowledge proofs provide mathematical certainty that you meet age requirements.
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-4xl mb-3 flex justify-center">
                      <Scale className="h-12 w-12 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Regulatory Compliance</h3>
                    <p className="text-gray-600 text-sm">
                      Meets age verification requirements while maintaining user privacy and data protection.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Implementation */}
            <Card className="backdrop-blur-md border-white/20 hover:shadow-xl transition-all duration-500 mb-12">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 text-indigo-500" />
                  <span>Technical Implementation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Circom Circuit</h4>
                      <p className="text-sm text-gray-600">
                        Age verification logic is implemented using Circom, a domain-specific language for zero-knowledge proofs, ensuring mathematical correctness.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Groth16 Protocol</h4>
                      <p className="text-sm text-gray-600">
                        We use the Groth16 zk-SNARK proving system, one of the most efficient and widely-adopted zero-knowledge proof schemes.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Smart Contract Integration</h4>
                      <p className="text-sm text-gray-600">
                        Verification contracts on Citrea zkEVM allow for on-chain proof validation without revealing any private information.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cross-Platform Compatibility</h4>
                      <p className="text-sm text-gray-600">
                        Our verification system works with any platform that supports ProofMe, enabling seamless age verification across services.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                    <h4 className="font-semibold text-gray-900 mb-2">Proof Generation Flow</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>1. <strong>Input Validation:</strong> Birth year is validated locally (1900-current year)</p>
                      <p>2. <strong>Age Calculation:</strong> Current year minus birth year determines age</p>
                      <p>3. <strong>Proof Creation:</strong> Circom circuit generates cryptographic proof of age ≥ 18</p>
                      <p>4. <strong>Blockchain Submission:</strong> Proof is submitted to Citrea zkEVM for permanent storage</p>
                      <p>5. <strong>Verification:</strong> Any service can verify the proof without accessing personal data</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust & Compliance */}
            <Card className="backdrop-blur-md border-white/20 hover:shadow-xl transition-all duration-500 mb-12">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Trust & Compliance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Privacy Standards</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• GDPR compliant - no personal data collection</li>
                      <li>• COPPA compliant - protects children's privacy</li>
                      <li>• Zero-knowledge architecture by design</li>
                      <li>• Local data processing only</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Security Features</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Cryptographic proof verification</li>
                      <li>• Blockchain immutability</li>
                      <li>• No centralized data storage</li>
                      <li>• Open-source verification contracts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <p className="text-lg text-gray-700 mb-6">
                Ready to experience privacy-first age verification?
              </p>
              <div className="flex justify-center">
                <WalletConnect 
                  onWalletConnected={(address, chainId) => {
                    console.log('Wallet connected:', address, chainId)
                  }}
                  verificationStatus={verificationStatus}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-md border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Age Verification
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Prove you are over 18 without revealing your exact birth date.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Wallet Info */}
              <Alert className="backdrop-blur-sm border-blue-200/50 text-blue-900">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Connected Wallet</h3>
                      <p className="text-blue-700 font-mono text-lg">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                    </div>
                    
                    {/* Network Info */}
                    <div className="space-y-2">
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
                            onClick={handleSwitchNetwork}
                            disabled={isSwitching}
                            variant="link"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 underline p-0 h-auto"
                          >
                            {isSwitching ? 'Switching...' : 'Switch to Citrea Testnet'}
                          </Button>
                        )}
                      </div>
                      
                      {/* Contract Status */}
                      <div className="text-sm text-gray-600 flex items-center justify-between">
                        <div>
                          <span className="font-medium">Chain ID:</span> {chain?.id || 'Unknown'} | 
                          <span className="font-medium ml-2">Contracts:</span> 
                          {chain?.id === 1337 ? (
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Deployed
                            </span>
                          ) : 
                           chain?.id === 5115 ? (areContractsDeployed ? (
                             <span className="flex items-center text-green-600">
                               <CheckCircle className="h-4 w-4 mr-1" />
                               Deployed
                             </span>
                           ) : (
                             <span className="flex items-center text-amber-600">
                               <AlertTriangle className="h-4 w-4 mr-1" />
                               Not Deployed
                             </span>
                           )) : 
                           (
                             <span className="flex items-center text-gray-600">
                               <HelpCircle className="h-4 w-4 mr-1" />
                               Unknown
                             </span>
                           )}
                        </div>

                      </div>
                    </div>


                  </div>
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <Label htmlFor="birthYear" className="text-sm font-semibold text-gray-700">
                    Birth Year
                  </Label>
                  <Input
                    type="number"
                    id="birthYear"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="1990"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm hover:border-gray-300"
                    required
                    disabled={isLoading || isWalletLoading}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    This information is only used locally to generate your proof and is never stored.
                  </p>
                  
                  {/* Network Status Warning - Only show when contracts not deployed */}
                  {chain?.id === 5115 && !areContractsDeployed && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-600 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                        </span>
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Citrea Testnet Detected</p>
                          <p className="text-xs mt-1">
                            ProofMe contracts are not yet deployed to Citrea testnet. 
                            You can still generate proofs locally, but blockchain verification will not work.
                          </p>
                          <p className="text-xs mt-1">
                            For full functionality, switch to Localhost (Chain ID: 1337) or deploy contracts to Citrea testnet.
                          </p>
                          <div className="mt-2">
                            <Button
                              onClick={() => {
                                if (switchNetwork) {
                                  switchNetwork(1337)
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className="text-amber-700 border-amber-300 hover:bg-amber-100"
                            >
                              <Home className="h-4 w-4 mr-2" />
                              Switch to Localhost
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {(() => {
                  const errorValue = error || localError || walletError
                  // Only show error if it's a valid string
                  return errorValue && typeof errorValue === 'string' && errorValue.trim() !== ''
                })() && (
                  <Alert variant="destructive" className="backdrop-blur-sm border-red-200/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      {(() => {
                        const errorValue = error || localError || walletError
                        // Double-check that we have a valid string
                        if (typeof errorValue !== 'string') {
                          console.error('⚠️ Non-string error value detected:', errorValue, 'Type:', typeof errorValue)
                          return 'An error occurred'
                        }
                        return errorValue
                      })()}
                    </AlertDescription>
                    {(() => {
                      const errorValue = error || localError || walletError
                      if (typeof errorValue === 'string' && errorValue.includes('unsupported network')) {
                        return true
                      }
                      return false
                    })() && (
                      <div className="mt-4">
                        <p className="text-sm mb-3">
                          To use ProofMe, you need to be connected to one of these networks:
                        </p>
                        <ul className="text-sm list-disc list-inside mb-4 space-y-1">
                          <li>Citrea Testnet (Chain ID: 5115)</li>
                          <li>Localhost (Chain ID: 1337) - for local development</li>
                        </ul>
                        <Button
                          onClick={handleSwitchNetwork}
                          disabled={isSwitching}
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {isSwitching ? 'Switching...' : 'Switch to Citrea Testnet'}
                        </Button>
                      </div>
                    )}
                    {(() => {
                      const errorValue = error || localError || walletError
                      if (typeof errorValue === 'string' && errorValue.includes('blockchain submission failed')) {
                        return true
                      }
                      return false
                    })() && (
                      <div className="mt-4">
                        <p className="text-sm mb-3">
                          The proof was generated locally but failed to submit to the blockchain. This could be due to:
                        </p>
                        <ul className="text-sm list-disc list-inside mb-4 space-y-1">
                          <li>Network connection issues</li>
                          <li>Insufficient gas fees</li>
                          <li>Contract function errors</li>
                          <li>Wallet transaction signing issues</li>
                        </ul>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setLocalError('')
                              setError(null)
                              setSuccessMessage('')
                            }}
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            🧹 Clear Errors
                          </Button>
                          <Button
                            onClick={() => {
                              if (chain?.id === 5115) {
                                deploymentChecker.debugCheckContracts(chain.id)
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="text-purple-600 hover:bg-purple-50"
                          >
                            🐛 Debug Contracts
                          </Button>
                          <Button
                            onClick={async () => {
                              try {
                                if (chain?.id === 5115) {
                                  console.log('🔍 Using RPC verification...')
                                  const result = await deploymentChecker.verifyWithRPC(chain.id)
                                  console.log('📊 RPC verification result:', result)
                                  if (result.overall) {
                                    alert('RPC verification successful! Contracts are deployed.')
                                    // Force refresh the deployment status
                                    setAreContractsDeployed(true)
                                  } else {
                                    alert('RPC verification failed. Contracts not deployed.')
                                    setAreContractsDeployed(false)
                                  }
                                }
                              } catch (error) {
                                console.error('Error with RPC verification:', error)
                                alert(`RPC verification error: ${error instanceof Error ? error.message : 'Unknown error'}`)
                              }
                            }}
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            RPC Verify
                          </Button>
                        </div>
                      </div>
                    )}
                  </Alert>
                )}

                {/* Success Message */}
                {successMessage && (
                  <Alert variant="default" className="backdrop-blur-sm border-green-200/50 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="font-medium text-green-800 whitespace-pre-line">
                      {successMessage}
                    </AlertDescription>
                    {currentTransaction?.status === 'confirmed' && (
                      <div className="mt-2 text-sm text-green-700">
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          Transaction confirmed on blockchain! Redirecting to status page...
                        </span>
                      </div>
                    )}
                    {successMessage.includes('Redirecting to status page') && (
                      <div className="mt-3 flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span className="text-sm text-green-700">Preparing to redirect...</span>
                      </div>
                    )}
                  </Alert>
                )}

                {/* Blockchain Submission Loading */}
                {isLoading && (
                  <Alert variant="default" className="backdrop-blur-sm border-blue-200/50 bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <AlertDescription className="font-medium text-blue-800">
                          <span className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-blue-600" />
                            Submitting proof to blockchain...
                          </span>
                        </AlertDescription>
                        <div className="text-sm text-blue-700 mt-1">
                          This may take a few moments. Please don't close this page.
                        </div>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Generated Proof Display */}
                {proof && (
                  <div className="space-y-4">
                    <Alert variant="default" className="backdrop-blur-sm border-blue-200/50 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Next Step:</strong> Your proof has been generated locally! Review the details below, then click "Submit Proof to Blockchain" to verify it on the blockchain.
                      </AlertDescription>
                    </Alert>
                    
                    <Card className="backdrop-blur-md border-green-200/50 bg-green-50/50">
                      <CardHeader>
                        <CardTitle className="text-xl font-semibold text-green-800 flex items-center">
                          <Lock className="h-5 w-5 mr-2 text-green-600" />
                          Generated Zero-Knowledge Proof
                          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-200">
                            Ready to Submit
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-green-700">
                          Your age verification proof has been generated successfully. Review the details below before submitting to the blockchain.
                        </CardDescription>
                      </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Proof Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-green-700">Birth Year</Label>
                          <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <span className="font-mono text-lg">{birthYear}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-green-700">Age Verification</Label>
                          <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <span className="font-mono text-lg text-green-600 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              {new Date().getFullYear() - parseInt(birthYear)} years old
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Proof Components */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-green-700">Proof Components</Label>
                        <div className="space-y-2">
                          <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Point A (G1)</div>
                            <div className="font-mono text-xs break-all">
                              x: {proof.proof.A[0].substring(0, 20)}...
                              <br />
                              y: {proof.proof.A[1].substring(0, 20)}...
                            </div>
                          </div>
                          <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Point B (G2)</div>
                            <div className="font-mono text-xs break-all">
                              x: [{proof.proof.B[0][0].substring(0, 20)}..., {proof.proof.B[0][1].substring(0, 20)}...]
                              <br />
                              y: [{proof.proof.B[1][0].substring(0, 20)}..., {proof.proof.B[1][1].substring(0, 20)}...]
                            </div>
                          </div>
                          <div className="p-3 bg-white border border-green-200 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Point C (G1)</div>
                            <div className="font-mono text-xs break-all">
                              x: {proof.proof.C[0].substring(0, 20)}...
                              <br />
                              y: {proof.proof.C[1].substring(0, 20)}...
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Public Signals */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-700">Public Signals</Label>
                        <div className="p-3 bg-white border border-green-200 rounded-lg">
                          <div className="font-mono text-xs break-all">
                            Age verification result: {proof.publicSignals[0].toString()}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                                                    onClick={async () => {
                            try {
                              setIsLoading(true)
                              setLocalError('')
                              console.log('🚀 Starting blockchain submission for birth year:', birthYear)
                              
                              const submittedProof = await generateAndSubmitProof(parseInt(birthYear))
                              console.log('🚀 Blockchain submission result:', submittedProof)
                              
                              if (submittedProof) {
                                // Show success message with proof details
                                const proofId = 'ZK_' + Date.now().toString(36)
                                const successMsg = `Proof submitted successfully!

Proof ID: ${proofId}
Birth Year: ${birthYear}
Status: Submitted to blockchain
                                Transaction: ${currentTransaction?.hash ? currentTransaction.hash.substring(0, 10) + '...' : 'Processing...'}

Redirecting to status page in 3 seconds...`
                                
                                setSuccessMessage(successMsg)
                                
                                // Create navigation state with all proof details
                                const navigationState = {
                                  proof: submittedProof,
                                  birthYear,
                                  timestamp: new Date().toISOString(),
                                  verified: false,
                                  transactionHash: currentTransaction?.hash || undefined,
                                  proofId: proofId
                                }
                                
                                console.log('🚀 Navigating to ProofStatus with state:', navigationState)
                                
                                // Only redirect if we have a transaction hash
                                if (currentTransaction?.hash) {
                                  // Redirect after showing success message
                                  setTimeout(() => {
                                    navigate('/status', { state: navigationState })
                                  }, 3000)
                                } else {
                                  // Update success message to indicate waiting for transaction
                                  setSuccessMessage(`Proof submitted successfully!

Proof ID: ${proofId}
Birth Year: ${birthYear}
Status: Waiting for transaction hash...

Please wait while your transaction is being processed on the blockchain.`)
                                }
                              } else {
                                setLocalError('Failed to submit proof to blockchain. Please try again.')
                              }
                            } catch (error) {
                              setLocalError(`Failed to submit proof: ${error instanceof Error ? error.message : 'Unknown error'}`)
                            } finally {
                              setIsLoading(false)
                            }
                          }}
                          disabled={isLoading}
                          size="lg"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Submitting to Blockchain...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Submit Proof to Blockchain
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => {
                            setProof(null)
                            setSuccessMessage('')
                            setLocalError('')
                          }}
                          variant="outline"
                          size="lg"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Generate New Proof
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || isWalletLoading}
                  size="lg"
                  className={`w-full py-4 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isLoading || isWalletLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white transform hover:scale-105 hover:shadow-xl shadow-lg border-0'
                  }`}
                >
                  {isLoading || isWalletLoading
                    ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{isWalletLoading ? 'Waiting for Wallet...' : 'Generating Proof...'}</span>
                      </div>
                    )
                    : (
                      <span className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" />
                        Generate Age Proof
                      </span>
                    )
                  }
                </Button>
                
                {/* Status Information */}
                {chain?.id === 5115 && areContractsDeployed && (
                  <div className="text-left text-sm text-green-600 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      ProofMe contracts deployed on Citrea testnet
                    </p>
                    <p className="text-xs mt-1 flex items-center">
                      <div className="w-6 mr-2"></div>
                      Full blockchain functionality available
                    </p>
                    <p className="text-xs mt-1 text-green-700 flex items-center">
                      <div className="w-6 mr-2"></div>
                      Ready to generate and verify proofs on the blockchain!
                    </p>
                    <p className="text-xs mt-1 text-blue-600 flex items-center">
                      <div className="w-6 mr-2"></div>
                      You can generate new proofs anytime - each one gets verified on the blockchain!
                    </p>
                  </div>
                )}


              </form>
              


              {/* Pending Status - Show while generating proof */}
              {(isLoading || isWalletLoading) && (
                <Alert className="backdrop-blur-sm border-amber-200/50 text-amber-800">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-amber-800 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-600" />
                        {isWalletLoading ? 'Waiting for Wallet Signature' : 'Proof Pending Verification'}
                      </h3>
                      <p className="text-amber-700 text-sm">
                        {isWalletLoading 
                          ? 'Please check your wallet to sign the proof generation transaction.'
                          : 'Your proof is being processed on the blockchain.'
                        }
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                        <span className="text-sm text-amber-600">
                          {isWalletLoading 
                            ? 'Waiting for wallet signature...'
                            : 'Generating and submitting proof...'
                          }
                        </span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}



              {/* ZK Proof Info */}
              <Card className="border-white/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>How ZK Proofs Work</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      Your birth year is used locally to generate a cryptographic proof
                    </p>
                    <p className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      The proof verifies you are over 18 without revealing your exact age
                    </p>
                    <p className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      The proof is submitted to the blockchain for permanent verification
                    </p>
                    <p className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      No personal data is ever stored on-chain
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProofForm 