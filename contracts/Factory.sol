pragma solidity ^0.8.0;

import "./batch/IBatch.sol";
import "./batch/IDefaultBatch.sol";
import "./batch/DefaultBatch.sol";
import "./batch/Batch.sol";

contract Factory {
    IDefaultBatch defaultBatch; 

    mapping(address=>address[]) batches;

    constructor () {
        defaultBatch = new DefaultBatch();
    }

    function getDefault() public view returns (address) {
        return address(defaultBatch);
    }

    function generateBatch(address admin) public {
        batches[admin].push(address(new Batch(admin)));
    }

    function getBatches(address admin) public view returns (address[] memory) {
        return batches[admin];
    }

}