require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // IMPORTANT: This line loads the .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      // Uses the INFURA_API_KEY from your .env
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      // Uses the PRIVATE_KEY from your .env
      accounts: [process.env.PRIVATE_KEY] 
    }
  },
  etherscan: {
    // Uses the ETHERSCAN_API_KEY from your .env
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  sourcify: {
    enabled: true
  }
};