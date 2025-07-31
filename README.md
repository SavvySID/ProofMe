
# 🛡️ ProofMe

**Zero-Knowledge Credential Verification on Bitcoin using Citrea zkEVM**

ProofMe enables users to prove identity attributes like age, citizenship, or degree completion, **without revealing any personal data**. Built with **Citrea**, the first Bitcoin-native zk-rollup, ProofMe brings privacy-preserving digital identity to the world's most secure blockchain.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-orange.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/Built%20with-React-blue.svg)](https://reactjs.org/)
[![Citrea](https://img.shields.io/badge/Built%20on-Citrea%20zkEVM-green.svg)](https://citrea.xyz/)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd ProofMe

# Run setup script
node scripts/setup.js

# Deploy contracts to Citrea testnet
npm run deploy:citrea

# Start the frontend
npm run dev
```

Visit `http://localhost:3000` to use the application!

---

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Circom** (`npm install -g circom`)
- **SnarkJS** (`npm install -g snarkjs`)
- **Citrea testnet cBTC** (get from [faucet](https://citrea.xyz/faucet))

---

## 🏗️ Project Structure

```
ProofMe/
├── contracts/           # Smart contracts
│   ├── AgeVerifier.sol  # ZK proof verifier (auto-generated)
│   └── ProofRegistry.sol # Proof storage and management
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   └── pages/      # Application pages
│   └── package.json
├── zk/                 # Zero-knowledge circuits
│   ├── ageCheck.circom # Age verification circuit
│   └── generate-proof.js # Proof generation script
├── scripts/            # Deployment and utility scripts
├── test/               # Contract tests
└── hardhat.config.js   # Hardhat configuration
```

---

## 🔧 Setup Instructions

### 1. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Citrea Testnet Configuration
CITREA_RPC_URL=https://rpc.testnet.citrea.xyz
PRIVATE_KEY=your_private_key_here

# Frontend Configuration (update after deployment)
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

### 3. Compile Contracts

**Note:** Due to PowerShell execution policy restrictions on Windows, you may need to use alternative compilation methods.

#### Option A: Verify Contracts (Recommended for Windows)
```bash
# Verify contract syntax without full compilation
npm run verify
```

#### Option B: Check ZK Setup (Recommended)
```bash
# Check ZK circuit setup status
npm run circuit:check
```

#### Option C: Full ZK Compilation (Advanced)
```bash
# Install Circom globally (requires admin privileges)
npm install -g circom

# Download powersOfTau file manually from:
# https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
# Place it in: node_modules/circomlib/

# Then run full compilation
npm run circuit:compile
```

#### Option D: Direct Compilation (Windows PowerShell)
```bash
# Use direct compilation script
npm run compile:direct
```

### 4. Deploy to Citrea Testnet

**Note:** Due to PowerShell execution policy restrictions, you may need to use alternative deployment methods.

#### Option A: Check Deployment Readiness
```bash
npm run deploy:check
```

#### Option B: Direct Deployment Check
```bash
npm run deploy:direct
```

#### Option C: Standard Deployment
```bash
npm run deploy:citrea
```

#### Option D: Direct Hardhat Deployment
```bash
npx hardhat run scripts/deploy.js --network citrea
```

**Before deploying:**
1. Update your `.env` file with your actual private key
2. Get cBTC from [Citrea faucet](https://citrea.xyz/faucet)
3. Ensure you have network connectivity

This will deploy both `AgeVerifier` and `ProofRegistry` contracts and save the addresses to `deployment.json`.

### 5. Update Frontend Configuration

After deployment, update your `.env` file with the deployed contract addresses from `deployment.json`.

### 6. Start Development Server

```bash
npm run dev
```

---

## 🧪 Testing

### Smart Contract Tests

```bash
npm test
```

### ZK Circuit Testing

```bash
# Compile the circuit
npm run circuit:compile

# Generate proof
npm run proof:generate 1995
```

---

## 🔐 How It Works

### 1. **User Input**
- User enters their birth year (locally, never stored)

### 2. **ZK Proof Generation**
- Circom circuit proves `age >= 18` without revealing actual age
- SnarkJS generates cryptographic proof

### 3. **On-Chain Verification**
- Proof submitted to Citrea zkEVM smart contract
- Contract verifies proof and stores result

### 4. **Reusable Credential**
- Verified status can be used across multiple platforms
- No personal data ever stored on-chain

---

## 🛠️ Development

### Available Scripts

```bash
# Smart Contracts
npm run compile          # Compile contracts
npm run test            # Run tests
npm run deploy:citrea   # Deploy to Citrea testnet
npm run deploy:local    # Deploy to local network

# ZK Circuits
npm run circuit:compile # Compile Circom circuit
npm run circuit:setup   # Generate proving/verification keys
npm run proof:generate  # Generate ZK proof
npm run proof:verify    # Verify ZK proof

# Frontend
npm run dev             # Start development server
npm run build           # Build for production
```

### Adding New Credential Types

1. Create new Circom circuit in `zk/`
2. Generate verifier contract
3. Update `ProofRegistry.sol` to handle new proof types
4. Add frontend components for new credential

---

## 🌐 Citrea Testnet Configuration

- **Chain Name**: Citrea Testnet
- **Chain ID**: 5115
- **Native Currency**: cBTC
- **RPC URL**: https://rpc.testnet.citrea.xyz
- **Explorer**: https://explorer.testnet.citrea.xyz
- **Faucet**: https://citrea.xyz/faucet

---

## 🔒 Security Features

- **Zero-Knowledge Proofs**: No personal data revealed
- **Bitcoin Security**: Built on Citrea zkEVM
- **Immutable Verification**: On-chain proof storage
- **Privacy-Preserving**: Only proves facts, not data
- **Reusable Credentials**: Single verification, multiple uses

---

## 📚 Documentation

- [Citrea Documentation](https://docs.citrea.xyz/)
- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [Hardhat Documentation](https://hardhat.org/docs)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Project Wiki](https://github.com/your-repo/wiki)

---

## 🙏 Acknowledgments

- [Citrea](https://citrea.xyz/) for Bitcoin-native zkEVM
- [Circom](https://circom.io/) for ZK circuit framework
- [SnarkJS](https://github.com/iden3/snarkjs) for proof generation
- [Hardhat](https://hardhat.org/) for development framework

---

## ► Problem

Every time you share your ID online, whether to verify your age or prove your qualifications, you risk **exposing sensitive personal data**. Traditional Web2 verification systems are centralized, leak-prone, and non-compliant with data privacy laws like GDPR and India's DPDPA.

**Users should be able to prove facts without revealing data.**  
That's what ProofMe solves!!

---

## ► Solution: ProofMe 

ProofMe solves this issue by enabling privacy-preserving credential validation using zero-knowledge proofs (ZKPs). Instead of revealing the actual information, users can confirm they possess valid credentials without disclosing the information itself. For example, a user can confirm they are over 18 years old without revealing their complete birth date and ID.

ProofMe leverages **zero-knowledge proofs (ZKPs)** and **Citrea's zkEVM** to allow users to:
- Prove facts like "I am over 18" or "I have a valid driver's license"
- Without revealing the underlying documents or data
- And with verification recorded on-chain (on Bitcoin via Citrea)
- Making the proof reusable across multiple platforms
- Ensuring verifiability without reliance on centralized servers
- Enabling DAOs, DeFi, and regulated dApps to adopt privacy-preserving compliance mechanisms

---

## ► How It Works

1. **Off-chain Verification**  
   A user verifies credentials with a trusted issuer (e.g. university, KYC provider).

2. **ZK Proof Generation**  
   A zero-knowledge proof is generated (e.g., using `circom` or `snarkjs`) asserting a specific attribute.

3. **On-chain Submission**  
   The proof is submitted to a smart contract on Citrea zkEVM.

4. **Trustless Verification**  
   Verifiers (dapps, DAOs, platforms) check on-chain proof status without accessing any raw data.

---

## ► Features

| Feature                    | Description |
|---------------------------|-------------|
| ZK Age Check            | Uses Circom circuit to prove `age > 18` |
| Verifiable Smart Contract | On-chain verifier emits success/failure |
| RainbowKit Wallet Connect | Plug and play Web3 wallet onboarding |
| Citrea zkEVM Compatible | Built for Bitcoin L2 scalability & privacy |
| Audit Trail for Verifiers | DAOs/apps can verify users without storing PII |

---

## ► Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Wallets**: RainbowKit(soon), Wagmi, Ethers.js
- **ZK Tooling**: Circom, SnarkJS
- **Contracts**: Solidity (Verifier + ProofHandler)
- **Chain**: Citrea zkEVM (zkRollup on Bitcoin)

---

## ► Built With

- **Citrea zkEVM** – zk-rollup over Bitcoin with EVM compatibility
- **Circom + SnarkJS** – ZKP circuit design and proof generation
- **Hardhat** – Smart contract tooling

---

## ► Why It's On-Chain

- **Immutability** of verification history
- **Public auditability** without leaking data
- **Interoperability** across ecosystems
- **Bitcoin grade security** via Citrea's ZK-rollup

> Web2 doesn't solve the privacy problem. Blockchain + ZK does!

---

## ► Use Cases

- Age-gated DeFi apps
- Anonymous DAO voting
- Degree verification without doxxing
- Country-based access control
- Private KYC confirmation

---

## ► Who It's For

- Developers building apps that require trustless identity verification
- DAOs and DeFi platforms seeking privacy-preserving compliance
- Users who care about privacy but need to prove credentials
- Regulated dApps that must gate access by age or geography

---

## 🔧 Troubleshooting

### PowerShell Execution Policy Issues (Windows)

If you encounter PowerShell execution policy errors:

```bash
# Option 1: Use Node directly
node scripts/verify-contracts.js

# Option 2: Enable PowerShell script execution (as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Option 3: Use Command Prompt instead of PowerShell
cmd
npm run verify
```

### Contract Compilation Issues

If contract compilation fails:

1. **Verify contract syntax:**
   ```bash
   npm run verify
   ```

2. **Install missing dependencies:**
   ```bash
   npm install dotenv
   ```

3. **For ZK circuit compilation:**
   ```bash
   npm install -g circom snarkjs
   node scripts/compile-zk.js
   ```

### Common Error Solutions

| Error | Solution |
|-------|----------|
| `Cannot find module 'dotenv'` | Run `npm install dotenv` |
| `File cannot be loaded because running scripts is disabled` | Use `node scripts/verify-contracts.js` |
| `circom: command not found` | Install with `npm install -g circom` |
| `snarkjs: command not found` | Use `npm run circuit:check` (local version works) |
| `PowerShell execution policy` | Use `node scripts/verify-contracts.js` directly |
