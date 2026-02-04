# Curve-Style AMM DApp

A decentralized exchange (DEX) built with *Hardhat* for the smart contracts and *React (Vite)* for the frontend. This project demonstrates a constant product automated market maker on the Sepolia testnet.

## 🚀 Project Structure
- */backend*: Smart contracts (Solidity), Hardhat configuration, and deployment scripts.
- */frontend*: React application using Wagmi, Viem, and Tailwind CSS.

## 🛠️ Tech Stack
- *Smart Contracts:* Solidity, Hardhat, OpenZeppelin
- *Frontend:* React, Vite, Wagmi, Shadcn/UI
- *Network:* Ethereum Sepolia Testnet

## ⚙️ Setup Instructions

### 1. Backend

```bash
cd backend
npm install
npx hardhat compile 
```


# 2. Frontend

Navigate to the frontend folder, install dependencies, and start the development server:

```bash 
cd frontend
npm install
npm run dev
```
## 🧪 How to Test
1. *Get a Wallet:* Install [MetaMask](https://metamask.io/).
2. *Switch to Sepolia:* Open MetaMask, click the network selector, and choose *Sepolia*.
3. *Get Test ETH:* Visit a faucet to get free SepoliaETH:
   - [Google Cloud Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) (Recommended)
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
4. *Swap:* Use the DApp interface to swap tokens!

# Environment Variables
To run this project locally, you must create a .env file in both the frontend and backend folders. Note: These files are ignored by Git for security.

# 📜 License
This project is licensed under the MIT License.
