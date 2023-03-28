// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Twitter {
    address payable public owner;

    constructor(address payable _owner) {
        owner = _owner;
    }

    function receiveFunds() external payable {
        // Funds will be received and stored in the contract
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        owner.transfer(address(this).balance);
    }
}
