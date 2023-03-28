// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Twitter {
    address payable public owner;

    constructor(address payable _owner) {
        owner = _owner;
    }

    struct User {
        string name;
        string bio;
        string profilePictureURL;
        bool exists;
    }

    mapping(address => User) public users;

    function createAccount(string memory _name, string memory _bio, string memory _profilePictureURL) public {
        // Check if user doesn't alreadty exist
        require(!users[msg.sender].exists, "User already exists");

        // Create a new user and store it in the mapping
        users[msg.sender] = User({
            name: _name.
            bio: _bio,
            profilePictureURL: _profilePictureURL,
            exists: true,
        })
    }

    function updateName(string memory _name) public {
        require(users[msg.sender].exists, "User does not exist");
        users[msg.sender].name = _name;
    }

    function updateBio(string memory _bio) public {
        require(users[msg.sender].exists, "User does not exist");
        users[msg.sender].bio = _bio;
    }

    function updateProfilePicture(string memory _url) public {
        require(users[msg.sender].exists, "User does not exist");
        users[msg.sender].profilePictureURL = _url;
    }

    function removeUser() public {
        require(users[msg.sender].exists, "User does not exist");
        delete users[msg.sender];
    }

    function receiveFunds() external payable {
        // Funds will be received and stored in the contract
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        owner.transfer(address(this).balance);
    }
}
