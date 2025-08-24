import { ethers } from 'ethers'
import { TransactionStatus } from '../types/global'

export class TransactionTracker {
  private static instance: TransactionTracker
  private transactions: Map<string, TransactionStatus> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): TransactionTracker {
    if (!TransactionTracker.instance) {
      TransactionTracker.instance = new TransactionTracker()
    }
    return TransactionTracker.instance
  }

  // Add a new transaction to track
  addTransaction(hash: string, chainId: number): void {
    const status: TransactionStatus = {
      hash,
      status: 'pending',
      confirmations: 0,
      requiredConfirmations: this.getRequiredConfirmations(chainId),
      timestamp: Date.now()
    }
    
    this.transactions.set(hash, status)
    this.startPolling(hash, chainId)
  }

  // Get transaction status
  getTransactionStatus(hash: string): TransactionStatus | undefined {
    return this.transactions.get(hash)
  }

  // Update transaction status
  updateTransactionStatus(hash: string, updates: Partial<TransactionStatus>): void {
    const current = this.transactions.get(hash)
    if (current) {
      const updated = { ...current, ...updates }
      this.transactions.set(hash, updated)
      
      // Stop polling if transaction is complete
      if (['confirmed', 'failed', 'network_error'].includes(updated.status)) {
        this.stopPolling(hash)
      }
    }
  }

  // Start polling for transaction status
  private startPolling(hash: string, chainId: number): void {
    if (this.pollingIntervals.has(hash)) {
      return
    }

    const interval = setInterval(async () => {
      try {
        await this.checkTransactionStatus(hash, chainId)
      } catch (error) {
        console.error(`Error checking transaction ${hash}:`, error)
        this.updateTransactionStatus(hash, {
          status: 'network_error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }, 5000) // Poll every 5 seconds

    this.pollingIntervals.set(hash, interval)
  }

  // Stop polling for a transaction
  private stopPolling(hash: string): void {
    const interval = this.pollingIntervals.get(hash)
    if (interval) {
      clearInterval(interval)
      this.pollingIntervals.delete(hash)
    }
  }

  // Check transaction status on blockchain
  private async checkTransactionStatus(hash: string, chainId: number): Promise<void> {
    const provider = this.getProvider(chainId)
    if (!provider) {
      throw new Error('Provider not available')
    }

    try {
      const tx = await provider.getTransaction(hash)
      if (!tx) {
        this.updateTransactionStatus(hash, {
          status: 'network_error',
          error: 'Transaction not found on blockchain'
        })
        return
      }

      const receipt = await provider.getTransactionReceipt(hash)
      if (receipt) {
        // Get confirmations - in newer ethers versions this is always a function
        let confirmations = 0
        try {
          confirmations = await receipt.confirmations()
        } catch {
          confirmations = 0
        }
        
        const requiredConfirmations = this.getRequiredConfirmations(chainId)
        
        if (confirmations >= requiredConfirmations) {
          this.updateTransactionStatus(hash, {
            status: 'confirmed',
            confirmations,
            receipt
          })
        } else {
          this.updateTransactionStatus(hash, {
            status: 'confirming',
            confirmations
          })
        }
      } else {
        // Transaction is still pending
        this.updateTransactionStatus(hash, {
          status: 'pending',
          confirmations: 0
        })
      }
    } catch (error) {
      console.error(`Error checking transaction ${hash}:`, error)
      this.updateTransactionStatus(hash, {
        status: 'network_error',
        error: error instanceof Error ? error.message : 'Failed to check status'
      })
    }
  }

  // Get required confirmations based on network
  private getRequiredConfirmations(chainId: number): number {
    switch (chainId) {
      case 1337: // Localhost
        return 1
      case 5115: // Citrea testnet
        return 3
      default:
        return 3
    }
  }

  // Get provider for the given chain
  private getProvider(chainId: number): ethers.Provider | null {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        return new ethers.BrowserProvider(window.ethereum)
      } catch {
        return null
      }
    }
    return null
  }

  // Get explorer URL for transaction
  getExplorerUrl(hash: string, chainId: number): string {
    switch (chainId) {
      case 1337: // Localhost
        return `http://localhost:8545/tx/${hash}`
      case 5115: // Citrea testnet
        return `https://explorer.testnet.citrea.xyz/tx/${hash}`
      default:
        return `https://etherscan.io/tx/${hash}`
    }
  }

  // Clean up all polling
  cleanup(): void {
    this.pollingIntervals.forEach((interval) => clearInterval(interval))
    this.pollingIntervals.clear()
    this.transactions.clear()
  }
}

export const transactionTracker = TransactionTracker.getInstance()
