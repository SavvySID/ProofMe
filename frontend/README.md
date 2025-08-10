# ProofMe Frontend

This is the React frontend for ProofMe - a privacy-first age verification system using zero-knowledge proofs on Bitcoin.

## Features

- 🔐 **Real ZK Proof Generation** - Generate cryptographic proofs in the browser
- ⚡ **Blockchain Integration** - Submit proofs to Citrea zkEVM for verification
- 🎯 **Smart Contract Interaction** - Full integration with AgeVerifier and ProofRegistry contracts
- 🔄 **Real-time Status** - Check verification status on-chain
- 🛡️ **Privacy-Preserving** - No personal data stored on-chain

## Architecture

### Core Components

- **`useWallet` Hook** - Manages wallet connection and contract interactions
- **`zkProof.ts`** - ZK proof generation utilities
- **`contracts.ts`** - Smart contract interaction utilities
- **`ProofForm.tsx`** - Age verification form with real ZK proof generation
- **`ProofStatus.tsx`** - Real-time blockchain verification status

### Integration Flow

1. **Wallet Connection** - Connect MetaMask or other Web3 wallet
2. **Proof Generation** - Generate ZK proof from birth year (locally)
3. **Blockchain Submission** - Submit proof to ProofRegistry contract
4. **Verification** - Contract verifies proof using AgeVerifier
5. **Status Check** - Real-time verification status from blockchain

## Development

### Prerequisites

- Node.js 16+
- MetaMask or Web3 wallet
- Local Hardhat node or Citrea testnet

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Connect wallet and test the integration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_CONTRACT_ADDRESSES={"localhost":{"AgeVerifier":"0x5FbDB2315678afecb367f032d93F642f64180aa3","ProofRegistry":"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"}}
```

## Usage

### For Users

1. Connect your Web3 wallet
2. Navigate to `/proof`
3. Enter your birth year
4. Generate ZK proof (takes ~2 seconds)
5. Submit proof to blockchain
6. View verification status

### For Verifiers

1. Use `isVerified(address)` to check user status
2. Use `getVerificationStatus(address)` for detailed info
3. Listen for `ProofVerified` events
4. No PII required - only wallet addresses

## Technical Details

### ZK Proof Generation

- Uses Circom circuits (simulated in browser)
- Generates Groth16 proofs
- Validates age >= 18 without revealing birth date
- Submits to AgeVerifier contract

### Smart Contracts

- **AgeVerifier** - Groth16 proof verifier
- **ProofRegistry** - Proof storage and management
- Events: `ProofVerified`, `ProofAlreadyVerified`, `ProofVerificationFailed`

### Blockchain Integration

- Supports local Hardhat network (chainId: 1337)
- Supports Citrea testnet (chainId: 5115)
- Real-time transaction monitoring
- Event parsing and status updates

## Testing

### Local Testing

1. Start local Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npm run deploy:local
```

3. Test frontend integration:
```bash
npm run dev
```

### Production Testing

1. Deploy to Citrea testnet:
```bash
npm run deploy:citrea
```

2. Update contract addresses in `config/contracts.ts`
3. Test with real blockchain

## Troubleshooting

### Common Issues

1. **Wallet not connecting** - Ensure MetaMask is installed and unlocked
2. **Contract not found** - Check contract addresses and network
3. **Proof generation fails** - Ensure birth year results in age >= 18
4. **Transaction fails** - Check gas fees and network connectivity

### Debug Mode

Enable debug logging by setting `localStorage.debug = 'proofme:*'` in browser console.

## Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details. 