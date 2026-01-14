// scripts/deploy.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1️⃣ Deploy MockToken A
  const MockToken = await ethers.getContractFactory("MockToken");
  const tokenA = await MockToken.deploy("Token A", "TKA", ethers.parseEther("1000000"));
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("Token A deployed to:", tokenAAddress);

  // 2️⃣ Deploy MockToken B
  const tokenB = await MockToken.deploy("Token B", "TKB", ethers.parseEther("1000000"));
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("Token B deployed to:", tokenBAddress);

  // 3️⃣ Deploy CurveAMM
  const CurveAMM = await ethers.getContractFactory("CurveAMM");
  const amm = await CurveAMM.deploy(tokenAAddress, tokenBAddress);
  await amm.waitForDeployment();
  const ammAddress = await amm.getAddress();
  console.log("CurveAMM deployed to:", ammAddress);

  // 4️⃣ AUTOMATION: Save addresses to Frontend
  console.log("\nUpdating frontend files...");
  saveFrontendFiles({
    AMM: ammAddress,
    TokenA: tokenAAddress,
    TokenB: tokenBAddress
  });

  console.log("✅ Deployment and Frontend sync complete!");
}

function saveFrontendFiles(addresses) {
  // This path assumes your structure: my-dapp-frontend/backend/scripts/deploy.js
  // We go up two levels to get to my-dapp-frontend/, then into frontend/src/constants/
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "constants");

  // Create the directory if it doesn't exist
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Write the addresses to a JSON file
  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(addresses, undefined, 2)
  );

  console.log(`Saved addresses to ${contractsDir}/contract-addresses.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});