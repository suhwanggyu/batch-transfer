// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
/** 
  *@title Batch
  *@author Wanggyu, Suh
*/
interface IBatch {
    function transfer(address[] memory recipient, uint256 amount) external payable;
    function transferEthWithDifferentValue(address[] memory recipient, uint256[] memory amount) external payable;
    function batch(address[] memory recipient, string[] memory token, uint256[] memory amount) external;
    function addToken(string memory name, IERC20 token) external;
}