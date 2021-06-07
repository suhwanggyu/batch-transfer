// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IDefaultBatch.sol";

/** 
  *@title DefaultBatch 
  *@author Wanggyu, Suh
*/
contract DefaultBatch is IDefaultBatch {

    function transfer(address[] memory recipient, uint256 amount) external override payable {
        require(amount * recipient.length == msg.value, "Transfer: Amount error");
        for(uint i = 0; i < recipient.length; i++) {
            payable(recipient[i]).transfer(amount);
        }
    }

    function transferEthWithDifferentValue(address[] memory recipient, uint256[] memory amount) external override payable {
        uint256 sum = 0;
        for(uint i = 0; i < amount.length; i++) { 
            sum += amount[i];
        }
        require(sum == msg.value, "Transfer: Amount error");
        for(uint i = 0; i < recipient.length; i++) {
            payable(recipient[i]).transfer(amount[i]);
        }
    }
}