// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/** 
  *@title IDefaultBatch 
  *@author Wanggyu, Suh
*/
interface IDefaultBatch {
    function transfer(address[] memory recipient, uint256 amount) external payable;
    function transferEthWithDifferentValue(address[] memory recipient, uint256[] memory amount) external payable;
}