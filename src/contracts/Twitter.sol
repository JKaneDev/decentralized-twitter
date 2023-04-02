// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './TweetToken.sol';
import './TweetNFT.sol';
import './Auction.sol';
import "@openzeppelin/contracts/utils/Counters.sol";

contract Twitter {

    // Contract owner address
    address payable public owner;
    // Tweet Token contract
    TweetToken public tweetToken;
    // Tweet NFT contract
    TweetNFT public tweetNFT;
    // Store baseURI for NFT (IPFS);
    string public baseURI;
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
    // Store auction addresses
    mapping(uint256 => address) public tweetAuctions;
    // Store account IDs
    using Counters for Counters.Counter;
    Counters.Counter private accountIds;

    constructor(address payable _owner, address _tweetTokenAddress, address _nftAddress) {
        owner = _owner;
        tweetToken = TweetToken(_tweetTokenAddress);
        tweetNFT = TweetNFT(_nftAddress);
        baseURI = "https://ipfs.io/ipfs/";
    }

    struct User {
        address userAddress;
        uint256 id;
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
        uint256 tipCount;
        bool exists;
        string imageUrl;
    }

    event AccountCreated(address userAddress, uint256 id, string name, string bio, string profilePictureURL, bool exists);
    event NameUpdated(address indexed user, string newName);
    event BioUpdated(address indexed user, string newBio);
    event ProfilePictureUpdated(address indexed user, string url);
    event AccountDeleted(string name, address user);
    event FollowerAdded(address userAddress, string user, string follower, address followerAddress);
    event FollowerRemoved(string user, string follower);
    event TweetCreated(uint256 id, address creator, string content, uint256 likeCount, uint256 retweetCount, uint256[] tips, uint256 tipCount, bool exists, string imageUrl);
    event TweetLiked(uint256 tweetId, uint256 likeCount);
    event ReTweeted(uint256 tweetId, uint256 retweetCount);
    event UserTipped(uint256 amount, uint256 tweetId, address creator, address tipper, string tipperName, uint256 tipCount);
    event TwitterReceivedFunds(address contractFrom, uint256 contractFromAmount);
    event FundsWithdrawn(address destinationWallet, uint256 balance);

    function createAccount(string memory _name, string memory _bio, string memory _profilePictureURL) public {
        // Check if user doesn't alreadty exist
        require(!users[msg.sender].exists, "User already exists");

        uint256 userId = accountIds.current();

        // Create a new user and store it in the mapping
        users[msg.sender] = User({
            userAddress: msg.sender,
            id: userId,
            name: _name,
            bio: _bio,
            profilePictureURL: _profilePictureURL,
            exists: true
        });

        emit AccountCreated(msg.sender, users[msg.sender].id, _name, _bio, _profilePictureURL, users[msg.sender].exists);
        accountIds.increment();
    }

    function updateName(string memory _name) public {
        require(users[msg.sender].exists, "User does not exist");
        users[msg.sender].name = _name;

        emit NameUpdated(msg.sender, _name);
    }

    function updateBio(string memory _bio) public {
        require(users[msg.sender].exists, "User does not exist");
        users[msg.sender].bio = _bio;

        emit BioUpdated(msg.sender, _bio);
    }

    function updateProfilePicture(string memory _url) public {
        require(users[msg.sender].exists, "User does not exist");
        users[msg.sender].profilePictureURL = _url;

        emit ProfilePictureUpdated(msg.sender, _url);
    }

    function removeUser() public {
        require(users[msg.sender].exists, "User does not exist");
        delete users[msg.sender];

        emit AccountDeleted(users[msg.sender].name, msg.sender);
    }

    function isFollowing(address user, address follower) public view returns (bool) {
        return _following[follower][user];
    }


    function getFollowerIndex(address user, address follower) public view returns (uint) {
        return _followerIndices[user][follower];
    }

    function becomeFollower(address user, address follower) public {
        require(users[user].exists, "User does not exist");
        require(users[follower].exists, "Follower does not exist");
        require(!_following[follower][user], "Not following");

        followers[user].push(follower); // add follower to followers array for that user
        uint256 index = followers[user].length - 1; // get index for follower
        _following[follower][user] = true; // set following status to true
        _followerIndices[user][follower] = index; // store index for follower

        emit FollowerAdded(users[user].userAddress, users[user].name, users[follower].name, users[follower].userAddress);
    }

    function removeFollower(address user, address follower) public {
        require(msg.sender == user || msg.sender == follower, "User does not have correct permissions");
        require(!_following[follower][user], "Not following");

        uint256 index = _followerIndices[user][follower];
        uint256 lastIndex = followers[user].length - 1;

        // Move the last follower to the index of the follower being removed
        followers[user][index] = followers[user][lastIndex];

        // Update the index of the moved follower
        _followerIndices[user][followers[user][index]] = index;

        // Remove the last follower and update the _following mapping
        followers[user].pop();
        _following[follower][user] = false;
        delete _followerIndices[user][follower];

        emit FollowerRemoved(users[user].name, users[follower].name);
    }

    function getFollowerAddresses(address user) public view returns (address[] memory) {
        require(users[user].exists, "User does not exist");
        return followers[user];
    }

    function createTweet(string memory _content, string memory _imageUrl) public {
        require(users[msg.sender].exists, "User does not exist");

        uint256 _tweetId = nextTweetId;

        tweets[_tweetId] = Tweet({
            id: _tweetId,
            creator: msg.sender,
            content: _content,
            likeCount: 0,
            retweetCount: 0,
            tips: new uint256[](0),
            tipCount: 0,
            exists: true,
            imageUrl: _imageUrl
        });

        emit TweetCreated(
            tweets[_tweetId].id, 
            tweets[_tweetId].creator, 
            tweets[_tweetId].content, 
            tweets[_tweetId].likeCount, 
            tweets[_tweetId].retweetCount, 
            tweets[_tweetId].tips,
            tweets[_tweetId].tipCount, 
            tweets[_tweetId].exists,
            tweets[_tweetId].imageUrl
        );

        nextTweetId++;
    }

    function likeTweet(uint256 _tweetId) public {
        tweets[_tweetId].likeCount++;

        emit TweetLiked(_tweetId, tweets[_tweetId].likeCount);
    }

    function retweet(uint256 _tweetId) public {
        tweets[_tweetId].retweetCount++;

        emit ReTweeted(_tweetId, tweets[_tweetId].retweetCount);
    }

    function tipUser(uint256 _tweetId, uint256 _amount) public {
        require(tweetToken.transferFrom(msg.sender, tweets[_tweetId].creator, _amount), "Transfer failed");
        tweets[_tweetId].tips.push(_amount);
        tweets[_tweetId].tipCount++;

        emit UserTipped(_amount, _tweetId, tweets[_tweetId].creator, msg.sender, users[msg.sender].name, tweets[_tweetId].tipCount);
    }

    function receiveFunds() external payable {
        // Funds will be received and stored in the contract
        emit TwitterReceivedFunds(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        owner.transfer(address(this).balance);

        emit FundsWithdrawn(msg.sender, address(this).balance);
    }
}
