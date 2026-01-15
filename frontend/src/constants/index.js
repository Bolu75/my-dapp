import addresses from "./contract-addresses.json";
import AMM_Artifact from "./CurveAMM.json";
import Token_Artifact from "./MockToken.json";

export const AMM_ADDRESS = addresses.AMM;
export const TOKEN_A_ADDRESS = addresses.TokenA;
export const TOKEN_B_ADDRESS = addresses.TokenB;

// Hardhat puts the ABI array inside an "abi" property of the JSON
export const AMM_ABI = AMM_Artifact.abi;
export const TOKEN_ABI = Token_Artifact.abi;