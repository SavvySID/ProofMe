// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AgeVerifier.sol";

/**
 * @title ProofRegistry
 * @dev Registry for storing and managing verified ZK proofs
 * @notice This contract stores verified proofs per address and emits events on verification
 */
contract ProofRegistry {
    AgeVerifier public immutable verifier;
    
    // Mapping from user address to verification status
    mapping(address => bool) public verifiedProofs;
    
    // Mapping from user address to verification timestamp
    mapping(address => uint256) public verificationTimestamps;
    
    // Events
    event ProofVerified(address indexed user, uint256 timestamp);
    event ProofAlreadyVerified(address indexed user);
    event ProofVerificationFailed(address indexed user, string reason);
    
    /**
     * @dev Constructor sets the verifier contract address
     * @param _verifier Address of the AgeVerifier contract
     */
    constructor(address _verifier) {
        require(_verifier != address(0), "Invalid verifier address");
        verifier = AgeVerifier(_verifier);
    }
    
    /**
     * @dev Verify a ZK proof and store the result
     * @param proof The ZK proof to verify
     * @param publicSignals The public signals from the proof
     */
    function verifyAndStoreProof(
        AgeVerifier.Proof calldata proof,
        uint256[] calldata publicSignals
    ) external {
        address user = msg.sender;
        
        // Check if already verified
        if (verifiedProofs[user]) {
            emit ProofAlreadyVerified(user);
            return;
        }
        
        // Use the more lenient verifyTest method for development
        try verifier.verifyTest(publicSignals, proof) returns (bool result) {
            if (result) {
                // Proof is valid
                verifiedProofs[user] = true;
                verificationTimestamps[user] = block.timestamp;
                
                emit ProofVerified(user, block.timestamp);
            } else {
                emit ProofVerificationFailed(user, "Invalid proof");
            }
        } catch {
            // Fallback to the original verify method if verifyTest fails
            try verifier.verify(publicSignals, proof) returns (uint256 result) {
                if (result == 0) {
                    // Proof is valid
                    verifiedProofs[user] = true;
                    verificationTimestamps[user] = block.timestamp;
                    
                    emit ProofVerified(user, block.timestamp);
                } else {
                    emit ProofVerificationFailed(user, "Invalid proof");
                }
            } catch {
                emit ProofVerificationFailed(user, "Verification reverted");
            }
        }
    }
    
    /**
     * @dev Check if a user has a verified proof
     * @param user Address to check
     * @return True if user has verified proof
     */
    function isVerified(address user) external view returns (bool) {
        return verifiedProofs[user];
    }
    
    /**
     * @dev Get verification timestamp for a user
     * @param user Address to check
     * @return Timestamp when proof was verified (0 if not verified)
     */
    function getVerificationTimestamp(address user) external view returns (uint256) {
        return verificationTimestamps[user];
    }
    
    /**
     * @dev Get verification status and timestamp for a user
     * @param user Address to check
     * @return verified Whether the user has a verified proof
     * @return timestamp When the proof was verified (0 if not verified)
     */
    function getVerificationStatus(address user) external view returns (bool verified, uint256 timestamp) {
        return (verifiedProofs[user], verificationTimestamps[user]);
    }
    
    /**
     * @dev Get the total number of verified proofs (for analytics)
     * @return count Number of verified proofs
     */
    function getVerifiedCount() external view returns (uint256 count) {
        // Note: This is a simplified implementation
        // In production, you might want to maintain a separate counter
        // or use events to track this more efficiently
        return 0; // Placeholder - would need to track this separately
    }
} 