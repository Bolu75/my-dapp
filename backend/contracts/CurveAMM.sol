// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CurveAMM {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    event Swap(address indexed user, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed user, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed user, uint256 amountA, uint256 amountB);

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // --- LIQUIDITY FUNCTIONS ---

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA = tokenA.balanceOf(address(this));
        reserveB = tokenB.balanceOf(address(this));

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA <= reserveA && amountB <= reserveB, "Insufficient reserves");

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
        
        reserveA = tokenA.balanceOf(address(this));
        reserveB = tokenB.balanceOf(address(this));

        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    // --- SWAP FUNCTIONS ---

    function swapAforB(uint256 amountA) external {
        uint256 balA = tokenA.balanceOf(address(this));
        uint256 balB = tokenB.balanceOf(address(this));
        
        require(amountA > 0, "Invalid amount");
        require(balA > 0 && balB > 0, "No liquidity");

        uint256 amountOut = (amountA * balB) / (balA + amountA);
        require(amountOut > 0, "Insufficient output");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transfer(msg.sender, amountOut);

        reserveA = tokenA.balanceOf(address(this));
        reserveB = tokenB.balanceOf(address(this));

        emit Swap(msg.sender, amountA, amountOut);
    }

    function swapBforA(uint256 amountB) external {
        uint256 balA = tokenA.balanceOf(address(this));
        uint256 balB = tokenB.balanceOf(address(this));

        require(amountB > 0, "Invalid amount");
        require(balA > 0 && balB > 0, "No liquidity");

        uint256 amountOut = (amountB * balA) / (balB + amountB);
        require(amountOut > 0, "Insufficient output");

        tokenB.transferFrom(msg.sender, address(this), amountB);
        tokenA.transfer(msg.sender, amountOut);

        reserveA = tokenA.balanceOf(address(this));
        reserveB = tokenB.balanceOf(address(this));

        emit Swap(msg.sender, amountB, amountOut);
    }

    // --- VIEW FUNCTIONS ---

    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }
}