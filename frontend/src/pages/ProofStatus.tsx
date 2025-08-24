import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'
import { ZKProof } from '../utils/zkProof'
import WalletConnect from '../components/WalletConnect'
import { useWallet } from '../hooks/useWallet'
import { NETWORKS } from '../config/contracts'
import { transactionTracker } from '../utils/transactionTracker'
import { deploymentChecker, DeploymentStatus } from '../utils/deploymentChecker'

const ProofStatus: React.FC = () => {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { 
    verificationStatus, 
    currentTransaction, 
    getTransactionExplorerUrl,
    checkStatus 
  } = useWallet()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const proofData = location.state as {
    proof: ZKProof
    birthYear: string
    timestamp: string
    verified: boolean
    transactionHash?: string
    proofId?: string
  } | null

  useEffect(() => {
    // Check verification status on component mount
    if (isConnected && address && chain) {
      checkStatus()
    }
    
    // If we have a transaction hash, try to get its status from the tracker
    if (proofData?.transactionHash && !currentTransaction) {
      const txStatus = transactionTracker.getTransactionStatus(proofData.transactionHash)
      if (txStatus) {
        console.log('📊 Found transaction status from tracker:', txStatus)
      }
    }
  }, [isConnected, address, chain, checkStatus, proofData?.transactionHash, currentTransaction])

  // Check if contracts are deployed on current network
  const [contractsStatus, setContractsStatus] = useState<{
    deployed: boolean
    message: string
    loading: boolean
  }>({ deployed: false, message: 'Checking deployment...', loading: true })

  useEffect(() => {
    const checkDeployment = async () => {
      if (!chain?.id) {
        setContractsStatus({ deployed: false, message: 'Network not detected', loading: false })
        return
      }

      try {
        const status = await deploymentChecker.checkDeployment(chain.id)
        setContractsStatus({
          deployed: status.overall,
          message: status.message,
          loading: false
        })
      } catch (error) {
        setContractsStatus({
          deployed: false,
          message: `Error checking deployment: ${error instanceof Error ? error.message : 'Unknown error'}`,
          loading: false
        })
      }
    }

    checkDeployment()
  }, [chain?.id])



  // Get transaction status for display
  const getTransactionStatusDisplay = () => {
    // If we have a current transaction, use its status
    if (currentTransaction) {
      switch (currentTransaction.status) {
        case 'pending':
          return { status: 'Pending', color: 'text-amber-600', icon: '⏳' }
        case 'confirming':
          return { status: `Confirming (${currentTransaction.confirmations}/${currentTransaction.requiredConfirmations})`, color: 'text-blue-600', icon: '⏳' }
        case 'confirmed':
          return { status: 'Confirmed', color: 'text-green-600', icon: '✅' }
        case 'failed':
          return { status: 'Failed', color: 'text-red-600', icon: '❌' }
        case 'network_error':
          return { status: 'Network Error', color: 'text-red-600', icon: '⚠️' }
        default:
          return { status: 'Processing', color: 'text-blue-600', icon: '⏳' }
      }
    }
    
    // If we have a transaction hash but no current transaction, check if it's verified
    if (proofData?.transactionHash) {
      if (verificationStatus.verified) {
        return { status: 'Successfully Verified', color: 'text-green-600', icon: '✅' }
      } else {
        // Try to get status from transaction tracker
        const txStatus = transactionTracker.getTransactionStatus(proofData.transactionHash)
        if (txStatus) {
          switch (txStatus.status) {
            case 'pending':
              return { status: 'Pending Confirmation', color: 'text-amber-600', icon: '⏳' }
            case 'confirming':
              return { status: `Confirming (${txStatus.confirmations}/${txStatus.requiredConfirmations})`, color: 'text-blue-600', icon: '⏳' }
            case 'confirmed':
              return { status: 'Confirmed on Blockchain', color: 'text-green-600', icon: '✅' }
            case 'failed':
              return { status: 'Transaction Failed', color: 'text-red-600', icon: '❌' }
            case 'network_error':
              return { status: 'Network Error', color: 'text-red-600', icon: '⚠️' }
            default:
              return { status: 'Processing on Blockchain', color: 'text-blue-600', icon: '⏳' }
          }
        }
        return { status: 'Processing on Blockchain', color: 'text-blue-600', icon: '📤' }
      }
    }
    
    // No transaction data available
    return { status: 'No Transaction', color: 'text-gray-500', icon: '📋' }
  }

  const transactionStatusDisplay = getTransactionStatusDisplay()
  
  // Get the best available transaction data for display
  const getTransactionData = () => {
    if (currentTransaction) {
      return currentTransaction
    }
    
    if (proofData?.transactionHash) {
      // Try to get from transaction tracker
      const txStatus = transactionTracker.getTransactionStatus(proofData.transactionHash)
      if (txStatus) {
        return txStatus
      }
      
      // Fallback to basic info from proofData
      return {
        hash: proofData.transactionHash,
        status: verificationStatus.verified ? 'confirmed' : 'pending',
        confirmations: verificationStatus.verified ? 1 : 0,
        requiredConfirmations: 1,
        timestamp: Date.now(),
        error: undefined
      }
    }
    
    return null
  }
  
  const transactionData = getTransactionData()

  // Generate proof content for download/print
  const generateProofContent = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ProofMe Age Verification Certificate</title>
    <style>
        @page {
            size: A4;
            margin: 0.5in;
        }
        body {
            font-family: Arial, sans-serif;
            max-width: 100%;
            margin: 0;
            padding: 10px;
            line-height: 1.4;
            color: #333;
            font-size: 12px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .certificate-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            background: #f3f4f6;
            padding: 12px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 3px solid #2563eb;
        }
        .details-section {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
            padding: 4px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-label {
            font-weight: bold;
            color: #374151;
            font-size: 11px;
        }
        .detail-value {
            color: #6b7280;
            font-family: monospace;
            font-size: 11px;
        }
        .verification-list {
            background: #ecfdf5;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid #10b981;
            margin: 10px 0;
        }
        .verification-item {
            margin: 4px 0;
            color: #065f46;
            font-size: 11px;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 10px;
        }
        .status-verified {
            color: #10b981;
            font-weight: bold;
        }
        .status-pending {
            color: #f59e0b;
            font-weight: bold;
        }
        h3 {
            margin: 8px 0 6px 0;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🛡️ ProofMe</div>
        <div class="subtitle">Zero-Knowledge Age Verification Certificate</div>
    </div>

    <div class="certificate-title">
        PROOF CERTIFICATE
        <br/>
        <small style="font-size: 16px; font-weight: normal; color: #666;">
            This document certifies that the wallet address holder has successfully proven 
            they are over 18 years old using zero-knowledge cryptographic proofs.
        </small>
    </div>

    <div class="details-section">
        <h3 style="margin-top: 0; color: #374151;">Proof Details</h3>
        <div class="detail-row">
            <span class="detail-label">Proof ID:</span>
            <span class="detail-value">${proofData?.proof ? 'ZK_' + Date.now().toString(36) : 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Birth Year:</span>
            <span class="detail-value">${proofData?.birthYear || 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Generated:</span>
            <span class="detail-value">${proofData?.timestamp ? new Date(proofData.timestamp).toLocaleString() : 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Wallet Address:</span>
            <span class="detail-value">${address || 'N/A'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Blockchain Status:</span>
            <span class="detail-value ${verificationStatus.verified ? 'status-verified' : 'status-pending'}">
                ${verificationStatus.verified ? 'Verified ✓' : 'Pending ⏳'}
            </span>
        </div>
        ${verificationStatus.verified && verificationStatus.timestamp > 0 ? `
        <div class="detail-row">
            <span class="detail-label">Verification Date:</span>
            <span class="detail-value">${new Date(verificationStatus.timestamp * 1000).toLocaleString()}</span>
        </div>
        ` : ''}
    </div>

    <div class="verification-list">
        <h3 style="margin-top: 0; color: #065f46;">What This Means</h3>
        <div class="verification-item">✓ You have successfully proven you are over 18 years old</div>
        <div class="verification-item">✓ Your actual birth date remains private and secure</div>
        <div class="verification-item">✓ This proof can be used across multiple platforms</div>
        <div class="verification-item">✓ The verification is cryptographically secure</div>
        <div class="verification-item">✓ Your proof is permanently stored on the blockchain</div>
    </div>

    <div class="footer">
        <strong>Generated by ProofMe</strong><br/>
        Privacy-first age verification powered by zero-knowledge proofs<br/>
        ${new Date().toLocaleString()}<br/><br/>
        This document is cryptographically verifiable on the blockchain.<br/>
        Visit the blockchain explorer to verify this proof independently.
    </div>
</body>
</html>`
  }

  // Handle PDF download
  const handleDownloadProof = () => {
    if (!proofData && !verificationStatus.verified) {
      alert('No proof data available to download')
      return
    }

    const htmlContent = generateProofContent()
    
    // Create a new window with the content
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then trigger download as PDF
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  // Handle direct print
  const handlePrintProof = () => {
    if (!proofData && !verificationStatus.verified) {
      alert('No proof data available to print')
      return
    }

    const htmlContent = generateProofContent()
    
    // Create a new window with the content for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }, 500)
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
                Proof Status & Verification
              </h1>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                View your age verification proof status, blockchain verification details, and download your verification certificate. 
                All powered by zero-knowledge proofs on the Bitcoin blockchain.
              </p>
            </div>

            {/* Main Connect Wallet Card */}
            <div className="card text-center mb-12">
              <h2 className="heading-2 mb-6 gradient-text">Connect Your Wallet</h2>
              <p className="body-text mb-8 text-gray-600">
                Connect your wallet to view your proof status and verification details
              </p>
              <div className="flex justify-center">
                <WalletConnect 
                  onWalletConnected={(address, chainId) => {
                    console.log('Wallet connected:', address, chainId)
                  }}
                  verificationStatus={verificationStatus}
                />
              </div>
              {error && (
                <div className="status-error mt-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* What You'll See Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card">
                <h3 className="heading-3 mb-4 text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Verification Status</span>
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>Real-time blockchain verification status</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>Proof generation timestamp and details</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>Wallet address and network information</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>Contract deployment status on current network</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="heading-3 mb-4 text-gray-900 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Proof Management</span>
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span>Download verification certificate as PDF</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span>Print proof for physical records</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span>Generate new proofs when needed</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">•</span>
                    <span>View proof history and timestamps</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof Details Section */}
            <div className="card mb-12">
              <h3 className="heading-3 mb-6 text-gray-900 text-center">Understanding Your Proof Status</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">📋</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Proof Details</h4>
                  <p className="text-gray-600 text-sm">
                    View your proof ID, birth year (never stored), generation timestamp, and wallet address associated with the verification.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">🔗</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Status</h4>
                  <p className="text-gray-600 text-sm">
                    Check if your proof has been verified on the blockchain and view the verification timestamp and network details.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">✅</div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Verification Status</h4>
                  <p className="text-gray-600 text-sm">
                    See whether your age verification proof is pending, verified, or if there are any issues with the verification process.
                  </p>
                </div>
              </div>
            </div>

            {/* Network & Contract Status */}
            <div className="card mb-12">
              <h3 className="heading-3 mb-6 text-gray-900 text-center">Network & Contract Information</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Supported Networks</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span>Citrea Testnet (Chain ID: 5115)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span>Localhost (Chain ID: 1337) - Development</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contract Status</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span>AgeVerifier Contract</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span>ProofRegistry Contract</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50/50 rounded-lg p-4 border border-gray-200/50">
                  <h4 className="font-semibold text-gray-900 mb-2">What Happens After Connection</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>1. <strong>Wallet Detection:</strong> Your wallet address and network are automatically detected</p>
                    <p>2. <strong>Contract Check:</strong> System verifies ProofMe contracts are deployed on your network</p>
                    <p>3. <strong>Status Retrieval:</strong> Your proof status is fetched from the blockchain</p>
                    <p>4. <strong>Verification Display:</strong> All verification details are shown in real-time</p>
                    <p>5. <strong>Action Options:</strong> Download, print, or generate new proofs as needed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits of Proof Status */}
            <div className="card mb-12">
              <h3 className="heading-3 mb-6 text-gray-900 text-center">Benefits of Proof Status Tracking</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">For Users</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Track verification progress in real-time</li>
                    <li>• Access proof certificates anytime, anywhere</li>
                    <li>• Verify blockchain confirmation independently</li>
                    <li>• Maintain proof history for future use</li>
                    <li>• Share verification status without revealing personal data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">For Verifiers</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Instant proof verification on blockchain</li>
                    <li>• No need to store or process personal data</li>
                    <li>• Cryptographically secure verification</li>
                    <li>• Cross-platform proof compatibility</li>
                    <li>• Regulatory compliance with privacy laws</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <p className="text-lg text-gray-700 mb-6">
                Ready to check your proof status and verification details?
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
          <div className="card">
            <div className="text-center mb-10">
              <h2 className="heading-2 mb-6 gradient-text">Proof Status</h2>
              <p className="body-text text-gray-600">
                Your age verification proof status and blockchain verification.
              </p>
            </div>

            {/* Wallet Info */}
            <div className="status-info mb-8 p-6">
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">Connected Wallet</h3>
              <p className="text-blue-700 font-mono text-lg">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>

            {/* Contract Status Warning */}
            {!contractsStatus.loading && !contractsStatus.deployed && (
              <div className="status-error mb-8 p-6">
                <h3 className="font-semibold text-red-800 mb-3 text-lg">⚠️ Contracts Not Available</h3>
                <p className="text-red-700 text-lg mb-3">
                  {contractsStatus.message}
                </p>
                {chain?.id === 5115 && !contractsStatus.deployed && (
                  <div className="space-y-3">
                    <p className="text-red-600 text-base">
                      ProofMe contracts are not yet deployed to Citrea Testnet. Please switch to Localhost (Chain ID: 1337) for testing.
                    </p>
                    <div className="flex space-x-3">
                                              <button
                          onClick={async () => {
                            setContractsStatus({ ...contractsStatus, loading: true })
                            try {
                              const status = await deploymentChecker.forceRefresh(chain?.id || 0)
                              setContractsStatus({
                                deployed: status.overall,
                                message: status.message,
                                loading: false
                              })
                            } catch (error) {
                              setContractsStatus({
                                deployed: false,
                                message: `Error refreshing: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                loading: false
                              })
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Status
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await deploymentChecker.debugCheckContracts(chain?.id || 0)
                            } catch (error) {
                              console.error('Error debugging contracts:', error)
                            }
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          🐛 Debug
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const verified = await deploymentChecker.manualVerifyContracts(chain?.id || 0)
                              setContractsStatus({
                                deployed: verified,
                                message: verified ? 'Contracts verified as deployed' : 'Contracts not verified as deployed',
                                loading: false
                              })
                              console.log(`Manual verification result: ${verified}`)
                            } catch (error) {
                              console.error('Error manually verifying contracts:', error)
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✅ Verify
                        </button>
                      <button
                        onClick={() => window.location.href = '/proof'}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        🏠 Go to Proof Form
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success Message when contracts are deployed */}
            {!contractsStatus.loading && contractsStatus.deployed && chain?.id === 5115 && (
              <div className="status-success mb-8 p-6">
                <h3 className="font-semibold text-green-800 mb-3 text-lg">✅ Contracts Available</h3>
                <p className="text-green-700 text-lg mb-3">
                  ProofMe contracts are successfully deployed on Citrea Testnet! You can now generate and verify proofs with full blockchain functionality.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.location.href = '/proof'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate New Proof
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {contractsStatus.loading && (
              <div className="status-info mb-8 p-6">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700">Checking contract deployment status...</span>
                </div>
              </div>
            )}
            
            {proofData || verificationStatus.verified ? (
              <div className="space-y-8">


                {/* Transaction Status */}
                {transactionData ? (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="heading-3 text-gray-900">Transaction Status</h4>
                      <button
                        onClick={() => {
                          if (proofData?.transactionHash) {
                            const txStatus = transactionTracker.getTransactionStatus(proofData.transactionHash)
                            if (txStatus) {
                              console.log('📊 Refreshed transaction status:', txStatus)
                            }
                          }
                          checkStatus()
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        title="Refresh transaction status"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className={`font-semibold ${transactionStatusDisplay.color}`}>
                          {transactionStatusDisplay.icon} {transactionStatusDisplay.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Transaction Hash:</span>
                        <span className="font-mono text-gray-800 text-sm break-all">
                          {transactionData.hash || 'Not yet available'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Confirmations:</span>
                        <span className="text-gray-800">
                          {transactionData.confirmations} / {transactionData.requiredConfirmations}
                        </span>
                      </div>
                      
                      {transactionData.timestamp && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-medium">Submitted:</span>
                          <span className="text-gray-800 text-sm">
                            {new Date(transactionData.timestamp).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {'error' in transactionData && transactionData.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">
                            <strong>Error:</strong> {transactionData.error}
                          </p>
                        </div>
                      )}
                      
                      {/* Transaction Explorer Link */}
                      {transactionData.hash && (
                        <div className="pt-3 border-t border-blue-200">
                          <a
                            href={getTransactionExplorerUrl(transactionData.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span>View on Explorer</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <div className="text-center">
                      <div className="text-3xl mb-3">⏳</div>
                      <h4 className="heading-3 text-amber-900 mb-2">Transaction Processing</h4>
                      <p className="text-amber-700 text-sm">
                        Your proof is being processed on the blockchain. The transaction hash will appear here once the transaction is submitted.
                      </p>
                    </div>
                  </div>
                )}

                {/* Proof Pending Verification Alert */}
                {proofData && !verificationStatus.verified && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start space-x-3">
                      <div className="text-amber-600 text-2xl">⏳</div>
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-2">Proof Pending Verification</h4>
                        <p className="text-amber-700 text-sm">
                          Your proof is being processed on the blockchain. This may take a few minutes depending on network conditions.
                        </p>
                        {currentTransaction && (
                          <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                            <p className="text-amber-800 text-sm">
                              <strong>Transaction Hash:</strong> {currentTransaction.hash}
                            </p>
                            <p className="text-amber-700 text-xs mt-1">
                              Status: {currentTransaction.status} 
                              {currentTransaction.status === 'confirming' && ` (${currentTransaction.confirmations}/${currentTransaction.requiredConfirmations})`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {proofData && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="text-3xl">🎉</div>
                      <div className="text-center">
                        <h4 className="text-xl font-bold mb-1">Proof Submitted Successfully!</h4>
                        <p className="text-green-100 text-sm">Your age verification proof has been submitted to the blockchain</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Proof Details */}
                {proofData && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 shadow-lg">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2">🔐</div>
                      <h4 className="heading-2 text-green-900 mb-2">Proof Generated Successfully!</h4>
                      <p className="text-green-700 text-sm">Your age verification proof has been created and submitted to the blockchain</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 border border-green-200">
                      <h5 className="font-semibold text-gray-900 mb-4 text-center">Proof Details</h5>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Proof ID:</span>
                          <span className="font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded">
                            {proofData.proofId || 'ZK_' + Date.now().toString(36)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Birth Year:</span>
                          <span className="text-gray-800 font-semibold">{proofData.birthYear || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Generated:</span>
                          <span className="text-gray-800">{proofData.timestamp ? new Date(proofData.timestamp).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Wallet Address:</span>
                          <span className="font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded">
                            {address || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600 font-medium">Blockchain Status:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            verificationStatus.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {verificationStatus.verified ? '✅ Verified' : `⏳ ${transactionStatusDisplay.status || 'Pending'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* What This Means */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-4 text-center">What This Means</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 text-lg">✓</span>
                      <span className="text-blue-800 text-sm">You have successfully proven you are over 18 years old</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 text-lg">✓</span>
                      <span className="text-blue-800 text-sm">Your actual birth date remains private and secure</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 text-lg">✓</span>
                      <span className="text-blue-800 text-sm">This proof can be used across multiple platforms</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 text-lg">✓</span>
                      <span className="text-blue-800 text-sm">The verification is cryptographically secure</span>
                    </div>
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <span className="text-blue-500 text-lg">✓</span>
                      <span className="text-blue-800 text-sm">Your proof is permanently stored on the blockchain</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleDownloadProof}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </button>
                    <button 
                      onClick={handlePrintProof}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/proof'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>Generate New Proof</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-6">
                  <svg className="w-20 h-20 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-4 text-gray-700">No Proof Found</h3>
                <p className="body-text mb-8 text-gray-600">
                  You haven't generated any age verification proofs yet, or your proof is still being processed.
                </p>
                
                {/* Debug Information */}
                <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left text-sm max-w-md mx-auto">
                  <p className="font-medium mb-2">Debug Information:</p>
                  <p>• Location state: {location.state ? 'Present' : 'Missing'}</p>
                  <p>• Proof data: {proofData ? 'Available' : 'Missing'}</p>

                  <p>• Current path: {location.pathname}</p>
                  {location.state && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <p className="font-medium">State data:</p>
                      <pre className="text-xs overflow-auto">{JSON.stringify(location.state, null, 2)}</pre>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => window.location.href = '/proof'}
                    className="btn-primary hover-lift"
                  >
                    Generate Your First Proof
                  </button>
                  
                  <button 
                    onClick={() => checkStatus()}
                    className="btn-secondary hover-lift ml-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Check Status
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProofStatus 