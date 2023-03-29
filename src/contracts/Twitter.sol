// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './Token.sol';

contract Twitter {
    address payable public owner;

    constructor(address payable _owner, address, _tweetTokenAddress) {
        owner = _owner;
        tweetToken = Token(_tweetTokenAddress);
    }

    struct User {
        bytes32 id;
        string name;
        string bio;
        string profilePictureURL;
        bool exists;
    }

    struct Tweet {
        uint256 id;
        address creator;
        string content;
        uint256 likeCount;
        uint256 retweetCount;
        uint256[] tips;
        uint256 tipCount = 0;
        bool exists;
    }

    // Store users
    mapping(address => User) public users; 
    // Store followers for each user
    mapping(address => address[]) public followers; 
    // Store user's following relationships 
    mapping(address => mapping(address => bool)) public _following; 
    // Store the index of the follower in the _followers array (user => (follower => index))
    mapping(address => mapping(address => uint256)) private _followerIndices; 
    // Tweet ID index counter
    uint256 private nextTweetId = 1;
    // Store tweets
    mapping(uint256 => Tweet) public tweets;


    function createAccount(string memory _name, string memory _bio, string memory _profilePictureURL) public {
        // Check if user doesn't alreadty exist
        require(!users[msg.sender].exists, "User already exists");

        bytes32 _userID = keccak256(abi.encodePacked(msg.sender, block.timestamp));

        // Create a new user and store it in the mapping
        users[msg.sender] = User({
            id: _userID,
            name: _name,
            bio: _bio,
            profilePictureURL: _profilePictureURL,
            exists: true,
        });
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

    function addFollower(address user, address follower) public {
        require(users[user].exists, "User does not exist");
        require(users[follower].exists, "Follower does not exist");
        require(_following[follower][user], "Not following");

        _followers[user].push(follower); // add follower to followers array for that user
        uint256 index = _followers[user].length - 1; // get index for follower
        _following[follower][user] = true; // set following status to true
        _followerIndices[user][follower] = index; // store index for follower
    }

    function removeFollower(address user, address follower) public {
        require(users[user].exists, "User does not exist");
        require(users[follower].exists, "Follower does not exist");
        require(!_following[follower][user], "Already following");

        uint256 index = _followerIndices[user][follower];
        uint256 lastIndex = _followers[user].length - 1;

        // Move the last follower to the index of the follower being removed
        _followers[user][index] = _followers[user][lastIndex];

        // Update the index of the moved follower
        _followerIndices[user][_followers[user][index]] = index;

        // Remove the last follower and update the _following mapping
        _followers[user].pop();
        _following[follower][user] = false;
        delete _followerIndices[user][follower];
    }

    function getFollowerAddresses(address user) public view returns (address[] memory) {
    require(users[user].exists, "User does not exist");
    return _followers[user];
    }

    function createTweet(string memory _content) public {
        require(users[msg.sender].exists, "User does not exist");

        tweets[nextTweetId] = Tweet({
            id: nextTweetId,
            creator: msg.sender,
            content: _content,
            likeCount: 0,
            retweetCount: 0,
            tips: new uint256[](0),
            exists: true,
        });

        newTweetId++;
    }

    function likeTweet(uint256 _tweetId) public {
        tweets[_tweetId].likeCount++;
    }

    function retweet(uint256 _tweetId) public {
        tweets[tweetId].retweetCount++;
    }

    function tipUser(uint256 _tweetId, uint256 _amount) public {
        require(tweetToken.transferFrom(msg.sender, tweets[_tweetId].creator, _amount), "Transfer failed");
        tweets[_tweetId].tips.push(_amount);
        tweets[_tweetId].tipCount++;
    }

    function receiveFunds() external payable {
        // Funds will be received and stored in the contract
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        owner.transfer(address(this).balance);
    }
}
