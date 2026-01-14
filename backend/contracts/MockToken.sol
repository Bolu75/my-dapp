// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) 
        ERC20(name, symbol) 
    {
        // initialSupply is passed from deploy.js (already in wei)
        _mint(msg.sender, initialSupply);
    }

    // Faucet function for visitors
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}