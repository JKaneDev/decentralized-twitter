// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './TweetToken.sol';
import './TweetNFT.sol';
import './Auction.sol';
import "@openzeppelin/contracts/utils/Counters.sol";

contract Twitter {

    address constant ETH = address(0);    
    address payable public owner;    
    TweetToken public tweetToken;    
    uint256 private constant conversionRate = 1000; // 1 ETH = 1000 TWEET
    TweetNFT public tweetNFT;    

    mapping(address => User) public users;    
    uint256 private nextTweetId = 1;    
    mapping(uint256 => Tweet) public tweets;    
    mapping(address => mapping(uint256 => bool)) private likedTweets;    
    mapping(uint256 => address) public tweetAuctions;    

    using Counters for Counters.Counter;
    Counters.Counter private accountIds;

    constructor(address payable _owner, address _tweetTokenAddress, address _nftAddress) {
        owner = _owner;
        tweetToken = TweetToken(_tweetTokenAddress);
        tweetNFT = TweetNFT(_nftAddress);
    }
    
    modifier onlyOwner {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    fallback() external {
        revert();
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
        string name;
        string content;
        string[] comments;
        address[] likes;
        uint256[] tips;
        bool exists;
        string imageUrl;
        uint256 timestamp;
    }

    event AccountCreated(address userAddress, uint256 id, string name, string bio, string profilePictureURL, bool exists);
    event TweetCreated(uint256 id, address creator, string name, string content, string[] comments, address[] likes, uint256[] tips, bool exists, string imageUrl, uint256 timestamp);
    event CommentAdded(uint256 tweetId, string comment, address commenter, string commenterName, string profilePic, uint256 timestamp);
    event TweetLiked(uint256 tweetId, address liker);
    event UserTipped(uint256 amount, uint256 tweetId, address creator, address tipper, string tipperName);
    event TwitterReceivedFunds(address contractFrom, uint256 contractFromAmount);
    event FundsWithdrawn(address destinationWallet, uint256 balance);
    event TweetTokenBought(uint256 tokenAmount, uint256 ethValue, address buyersAddress, uint256 buyersBalanceBefore, uint256 buyersNewBalance);


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


    function getTweet(uint256 id) public view returns (Tweet memory) {
        Tweet memory tweet = tweets[id];
        return tweet;
    }

    function createTweet(string memory _content, string memory _imageUrl) public {
        require(users[msg.sender].exists, "User does not exist");

        uint256 _tweetId = nextTweetId;

        tweets[_tweetId] = Tweet({
            id: _tweetId,
            name: users[msg.sender].name,
            creator: msg.sender,
            content: _content,
            comments: new string[](0),
            likes: new address[](0),                                    
            tips: new uint256[](0),            
            exists: true,
            imageUrl: _imageUrl,
            timestamp: block.timestamp
        });

        emit TweetCreated(
            tweets[_tweetId].id, 
            tweets[_tweetId].creator, 
            tweets[_tweetId].name,
            tweets[_tweetId].content, 
            tweets[_tweetId].comments,
            tweets[_tweetId].likes,                               
            tweets[_tweetId].tips,            
            tweets[_tweetId].exists,
            tweets[_tweetId].imageUrl,
            tweets[_tweetId].timestamp
        );

        nextTweetId++;
    }

    function createComment(uint256 _tweetId, string memory _comment) public {
        require(users[msg.sender].exists, "User does not exist");
        require(tweets[_tweetId].exists, "Tweet does not exist");

        tweets[_tweetId].comments.push(_comment);

        emit CommentAdded(_tweetId, _comment, msg.sender, users[msg.sender].name, users[msg.sender].profilePictureURL, block.timestamp);
    }

    function likeTweet(uint256 _tweetId) public {
        require(!likedTweets[msg.sender][_tweetId], "You have already liked this tweet");
                
        likedTweets[msg.sender][_tweetId] = true;
        tweets[_tweetId].likes.push(msg.sender);

        emit TweetLiked(_tweetId, msg.sender);
    }

    function tipUser(uint256 _tweetId, uint256 _amount) public {
        require(_amount > 0, "Amount should be greater than 0");
        tweetToken.transferFrom(msg.sender, tweets[_tweetId].creator, _amount);
        tweets[_tweetId].tips.push(_amount);

        emit UserTipped(_amount, _tweetId, tweets[_tweetId].creator, msg.sender, users[msg.sender].name);
    }

    function receiveFunds() external payable {
        // Funds will be received and stored in the contract
        emit TwitterReceivedFunds(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        uint256 balance = address(this).balance;
        payable(owner).transfer(address(this).balance);

        emit FundsWithdrawn(msg.sender, balance);
    }

    function buyTweetTokens(uint256 tokenAmount) external payable {
        uint256 ethValue = tokenAmount / conversionRate;

        require(msg.value >= ethValue, "You must send some ETH to buy tokens");

        require(tweetToken.balanceOf(address(this)) >= tokenAmount, "Insufficient Tweet Tokens available");

        uint256 buyersBalanceBefore = tweetToken.balanceOf(msg.sender);
        tweetToken.transfer(msg.sender, tokenAmount);
        uint256 buyersNewBalance = tweetToken.balanceOf(msg.sender);

        emit TweetTokenBought(tokenAmount, ethValue, msg.sender, buyersBalanceBefore, buyersNewBalance);
    }
}