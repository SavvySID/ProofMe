const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying ProofMe contracts to Citrea testnet...");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);
    
    // Get balance using ethers v6 syntax
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    try {
        // Deploy AgeVerifier first
        console.log("\n📋 Deploying AgeVerifier...");
        const AgeVerifier = await ethers.getContractFactory("AgeVerifier");
        const ageVerifier = await AgeVerifier.deploy();
        await ageVerifier.waitForDeployment();
        const ageVerifierAddress = await ageVerifier.getAddress();
        console.log("✅ AgeVerifier deployed to:", ageVerifierAddress);
        
        // Deploy ProofRegistry with AgeVerifier address
        console.log("\n📋 Deploying ProofRegistry...");
        const ProofRegistry = await ethers.getContractFactory("ProofRegistry");
        const proofRegistry = await ProofRegistry.deploy(ageVerifierAddress);
        await proofRegistry.waitForDeployment();
        const proofRegistryAddress = await proofRegistry.getAddress();
        console.log("✅ ProofRegistry deployed to:", proofRegistryAddress);
        
        // Get network info
        const network = await ethers.provider.getNetwork();
        
        // Log deployment summary
        console.log("\n🎉 Deployment Summary:");
        console.log("================================");
        console.log("AgeVerifier:", ageVerifierAddress);
        console.log("ProofRegistry:", proofRegistryAddress);
        console.log("Network:", network.name || "Unknown");
        console.log("Chain ID:", network.chainId);
        console.log("================================");
        
        // Save deployment addresses to file
        const deploymentInfo = {
            network: network.name || "citrea",
            chainId: Number(network.chainId), // Convert BigInt to Number for JSON serialization
            contracts: {
                AgeVerifier: ageVerifierAddress,
                ProofRegistry: proofRegistryAddress
            },
            deployer: deployer.address,
            timestamp: new Date().toISOString()
        };
        
        const fs = require("fs");
        fs.writeFileSync(
            "deployment.json",
            JSON.stringify(deploymentInfo, null, 2)
        );
        console.log("💾 Deployment info saved to deployment.json");
        
        // Verify contracts on explorer (if supported)
        if (network.chainId === 5115) { // Citrea testnet
            console.log("\n🔍 Verifying contracts on explorer...");
            try {
                await hre.run("verify:verify", {
                    address: ageVerifierAddress,
                    constructorArguments: [],
                });
                console.log("✅ AgeVerifier verified on explorer");
                
                await hre.run("verify:verify", {
                    address: proofRegistryAddress,
                    constructorArguments: [ageVerifierAddress],
                });
                console.log("✅ ProofRegistry verified on explorer");
            } catch (error) {
                console.log("⚠️ Contract verification failed:", error.message);
            }
        }
        
        console.log("\n🎯 Next steps:");
        console.log("1. Update your .env file with the contract addresses");
        console.log("2. Run 'npm run dev' to start the frontend");
        console.log("3. Test the proof generation and verification flow");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    }
}

// Handle script execution
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Script failed:", error);
            process.exit(1);
        });
}

module.exports = { main }; 