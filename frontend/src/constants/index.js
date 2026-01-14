import addresses from "./contract-addresses.json";

// Correct path to reach the artifacts from the frontend folder
import AMM_Artifact from "../../../backend/artifacts/contracts/CurveAMM.sol/CurveAMM.json";
import Token_Artifact from "../../../backend/artifacts/contracts/MockToken.sol/MockToken.json";

export const AMM_ADDRESS = addresses.AMM;
export const TOKEN_A_ADDRESS = addresses.TokenA;
export const TOKEN_B_ADDRESS = addresses.TokenB;

export const AMM_ABI = AMM_Artifact.abi;
export const TOKEN_ABI = Token_Artifact.abi;