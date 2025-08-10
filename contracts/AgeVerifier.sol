// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/*
 * Simplified Age Verifier for ProofMe
 * This is a testing version that can work with our current proof generation
 * In production, this would be replaced with the full Groth16 verifier
 */

contract AgeVerifier {
    struct G1Point {
        uint256 X;
        uint256 Y;
    }
    
    struct G2Point {
        uint256[2] X;
        uint256[2] Y;
    }
    
    struct Proof {
        G1Point A;
        G2Point B;
        G1Point C;
    }
    
    // Simplified verification for testing
    // This checks if the proof has the right structure and the public signal indicates age >= 18
    function verify(uint[] memory input, Proof memory proof) external pure returns (uint) {
        // Basic validation
        require(input.length > 0, "verifier-bad-input");
        require(proof.A.X != 0, "proof-invalid-A");
        require(proof.A.Y != 0, "proof-invalid-A");
        require(proof.B.X[0] != 0, "proof-invalid-B");
        require(proof.B.X[1] != 0, "proof-invalid-B");
        require(proof.B.Y[0] != 0, "proof-invalid-B");
        require(proof.B.Y[1] != 0, "proof-invalid-B");
        require(proof.C.X != 0, "proof-invalid-C");
        require(proof.C.Y != 0, "proof-invalid-C");
        
        // Check if the first public signal indicates age >= 18
        if (input.length > 0 && input[0] == 1) {
            return 0; // Verification successful
        }
        
        return 1; // Verification failed
    }
    
    // Alternative verification method that's more lenient for testing
    function verifySimple(uint[] memory input, Proof memory proof) external pure returns (bool) {
        // Basic structure validation
        if (proof.A.X == 0 || proof.A.Y == 0) return false;
        if (proof.B.X[0] == 0 || proof.B.X[1] == 0) return false;
        if (proof.B.Y[0] == 0 || proof.B.Y[1] == 0) return false;
        if (proof.C.X == 0 || proof.C.Y == 0) return false;
        
        // Check if age >= 18 (input[0] should be 1)
        if (input.length > 0 && input[0] == 1) {
            return true;
        }
        
        return false;
    }
    
    // Test verification that always passes for development
    function verifyTest(uint[] memory input, Proof memory proof) external pure returns (bool) {
        // For testing purposes, accept any proof with valid structure
        if (proof.A.X == 0 && proof.A.Y == 0) return false;
        if (proof.B.X[0] == 0 && proof.B.X[1] == 0) return false;
        if (proof.B.Y[0] == 0 && proof.B.Y[1] == 0) return false;
        if (proof.C.X == 0 && proof.C.Y == 0) return false;
        
        // Accept if age >= 18
        if (input.length > 0 && input[0] == 1) {
            return true;
        }
        
        return false;
    }
} 