// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IBatch.sol";
/** 
  *@title Batch
  *@author Wanggyu, Suh
  *@notice Batch transfer contract
      1. Send ethereum multiple times with same amount.
      2. Send erc20 multiple times with different amount.
        - (1) Before call batch, send token to this contract.
        - (2) call batch function.
      3. Send ethereum multiple times with different amount.
 */
contract Batch is IBatch {
    mapping (string => IERC20) private tokens;
    mapping (address => bool) private administrators;
    bool private addable;

    modifier onlyAdmin {
        require(administrators[msg.sender] == true, "Transfer: not allowed account");
        _;
    }

    modifier modeAddable {
        require(addable, "Transfer: not allowed to add administrator");
        _;
    }
    
    constructor() {
        administrators[msg.sender] = true;
        addable = true;
    }
    
    function transfer(address[] memory recipient, uint256 amount) external override payable {
        require(amount * recipient.length == msg.value, "Transfer: Amount error");
        for(uint i = 0; i < recipient.length; i++) {
            payable(recipient[i]).transfer(amount);
        }
    }

    function transferEthWithDifferentValue(address[] memory recipient, uint256[] memory amount) external override payable onlyAdmin {
        uint256 sum = 0;
        for(uint i = 0; i < amount.length; i++) { 
            sum += amount[i];
        }
        require(sum == msg.value, "Transfer: Amount error");
        for(uint i = 0; i < recipient.length; i++) {
            payable(recipient[i]).transfer(amount[i]);
        }
    }
    
    function batch(address[] memory recipient, string[] memory token, uint256[] memory amount) external override onlyAdmin {
        require(recipient.length == token.length && recipient.length == amount.length, "Transfer: Invalid input");
        for(uint i = 0; i < recipient.length; i++) {
            tokens[token[i]].transfer(recipient[i], amount[i]);
        }
    }
    
    function addToken(string memory name, IERC20 token) external override onlyAdmin {
        tokens[name] = token;
    }


    function withdraw(uint256 amount, string memory token) public onlyAdmin {
        tokens[token].transfer(msg.sender, amount);
    }

    /**
        @dev add a administrator
    */
    function addAdmin(address newAdmin) public onlyAdmin modeAddable {
        administrators[newAdmin] = true;
    }

    /**
        @dev Once call this function, can not add administrator forever
    */
    function blockAddable() public onlyAdmin {
        addable = false;
    }
}