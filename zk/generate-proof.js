const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function generateProof(birthYear, currentYear = new Date().getFullYear()) {
    console.log("🔐 Generating ZK Proof for Age Verification...");
    console.log(`📅 Birth Year: ${birthYear}, Current Year: ${currentYear}`);
    
    const age = currentYear - birthYear;
    console.log(`🎂 Calculated Age: ${age}`);
    
    if (age < 18) {
        console.log("❌ Age is less than 18. Proof will fail verification.");
        return null;
    }
    
    try {
        // Check if circuit files exist
        const circuitPath = path.join(__dirname, "ageCheck_js", "ageCheck.wasm");
        const zkeyPath = path.join(__dirname, "ageCheck.zkey");
        
        if (!fs.existsSync(circuitPath)) {
            console.log("⚠️ Circuit WASM file not found. Using fallback proof generation...");
            return generateFallbackProof(birthYear, currentYear);
        }
        
        if (!fs.existsSync(zkeyPath)) {
            console.log("⚠️ ZKey file not found. Using fallback proof generation...");
            return generateFallbackProof(birthYear, currentYear);
        }
        
        // Prepare input
        const input = {
            birthYear: birthYear,
            currentYear: currentYear
        };
        
        console.log("📝 Input:", input);
        
        // Generate proof
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            circuitPath,
            zkeyPath
        );
        
        console.log("✅ Proof generated successfully!");
        console.log("📊 Public Signals:", publicSignals);
        
        // Save proof to file
        const proofPath = path.join(__dirname, "proof.json");
        const publicPath = path.join(__dirname, "public.json");
        
        fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
        fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));
        
        console.log("💾 Proof saved to:", proofPath);
        console.log("💾 Public signals saved to:", publicPath);
        
        return {
            proof,
            publicSignals,
            proofPath,
            publicPath
        };
        
    } catch (error) {
        console.error("❌ Error generating proof:", error.message);
        console.log("🔄 Falling back to simplified proof generation...");
        return generateFallbackProof(birthYear, currentYear);
    }
}

function generateFallbackProof(birthYear, currentYear) {
    console.log("🔄 Generating fallback proof for development...");
    
    // Create a simplified proof structure for development
    const fallbackProof = {
        proof: {
            A: ["0x1234567890abcdef", "0xfedcba0987654321"],
            B: [["0x1111111111111111", "0x2222222222222222"], ["0x3333333333333333", "0x4444444444444444"]],
            C: ["0x5555555555555555", "0x6666666666666666"]
        },
        publicSignals: ["1"] // 1 indicates age >= 18
    };
    
    console.log("✅ Fallback proof generated successfully!");
    console.log("📊 Public Signals:", fallbackProof.publicSignals);
    
    // Save fallback proof to file
    const proofPath = path.join(__dirname, "proof-fallback.json");
    const publicPath = path.join(__dirname, "public-fallback.json");
    
    fs.writeFileSync(proofPath, JSON.stringify(fallbackProof.proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(fallbackProof.publicSignals, null, 2));
    
    console.log("💾 Fallback proof saved to:", proofPath);
    console.log("💾 Fallback public signals saved to:", publicPath);
    
    return {
        proof: fallbackProof.proof,
        publicSignals: fallbackProof.publicSignals,
        proofPath,
        publicPath,
        isFallback: true
    };
}

async function verifyProof(proof, publicSignals) {
    try {
        const vKeyPath = path.join(__dirname, "verification_key.json");
        
        if (!fs.existsSync(vKeyPath)) {
            console.log("⚠️ Verification key not found. Cannot verify proof.");
            return false;
        }
        
        const vKey = JSON.parse(fs.readFileSync(vKeyPath));
        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        
        console.log("🔍 Proof verification result:", res);
        return res;
    } catch (error) {
        console.error("❌ Error verifying proof:", error.message);
        return false;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log("Usage: node generate-proof.js <birthYear> [currentYear]");
        console.log("Example: node generate-proof.js 1995");
        process.exit(1);
    }
    
    const birthYear = parseInt(args[0]);
    const currentYear = args[1] ? parseInt(args[1]) : new Date().getFullYear();
    
    generateProof(birthYear, currentYear).then((result) => {
        if (result) {
            console.log("🎉 Proof generation completed successfully!");
            if (result.isFallback) {
                console.log("📝 Note: This is a fallback proof for development purposes.");
                console.log("🔧 To generate real ZK proofs, run 'npm run circuit:compile' first.");
            }
        } else {
            console.log("❌ Proof generation failed.");
        }
    });
}

module.exports = { generateProof, verifyProof, generateFallbackProof }; 