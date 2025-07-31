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
            throw new Error("Circuit WASM file not found. Run 'npm run circuit:compile' first.");
        }
        
        if (!fs.existsSync(zkeyPath)) {
            throw new Error("ZKey file not found. Run 'npm run circuit:setup' first.");
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
        return null;
    }
}

async function verifyProof(proof, publicSignals) {
    try {
        const vKey = JSON.parse(fs.readFileSync(path.join(__dirname, "verification_key.json")));
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
        } else {
            console.log("💥 Proof generation failed!");
            process.exit(1);
        }
    });
}

module.exports = {
    generateProof,
    verifyProof
}; 