
# 🛡️ ProofMe

**Zero-Knowledge Credential Verification on Bitcoin using Citrea zkEVM**

ProofMe enables users to prove identity attributes like age, citizenship, or degree completion, **without revealing any personal data**. Built with **Citrea**, the first Bitcoin-native zk-rollup, ProofMe brings privacy-preserving digital identity to the world’s most secure blockchain.


---

## ► Problem

Every time you share your ID online, whether to verify your age or prove your qualifications, you risk **exposing sensitive personal data**. Traditional Web2 verification systems are centralized, leak-prone, and non-compliant with data privacy laws like GDPR and India’s DPDPA.

**Users should be able to prove facts without revealing data.**  
That's what ProofMe solves!!

---

## ► Solution: ProofMe 

ProofMe solves this issue by enabling privacy-preserving credential validation using zero-knowledge proofs (ZKPs). Instead of revealing the actual information, users can confirm they possess valid credentials without disclosing the information itself. For example, a user can confirm they are over 18 years old without revealing their complete birth date and ID.

ProofMe leverages **zero-knowledge proofs (ZKPs)** and **Citrea’s zkEVM** to allow users to:
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
- **Wallets**: RainbowKit, Wagmi, Ethers.js
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
- **Bitcoin grade security** via Citrea’s ZK-rollup

> Web2 doesn’t solve the privacy problem. Blockchain + ZK does!

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
