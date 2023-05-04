// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './TweetToken.sol';
import './TweetNFT.sol';
import './Auction.sol';
import "@openzeppelin/contracts/utils/Counters.sol";

contract Twitter {

    address constant MATIC = address(0);    
    address payable public owner;    
    TweetToken public tweetToken;    
    uint256 private constant conversionRate = 1000; // 1 MATIC = 1000 TWEET
    TweetNFT public tweetNFT;    
    string public baseURI;    
    mapping(address => User) public users;    
    mapping(address => mapping(address => uint256)) public balances; 
    mapping(address => address[]) public followers;     
    mapping(address => mapping(address => bool)) public following;     
    mapping(address => mapping(address => uint256)) private followerIndices;     
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
        baseURI = "https://ipfs.io/ipfs/";
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

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event AccountCreated(address userAddress, uint256 id, string name, string bio, string profilePictureURL, bool exists);
    event NameUpdated(address indexed user, string newName);
    event BioUpdated(address indexed user, string newBio);
    event ProfilePictureUpdated(address indexed user, string url);
    event AccountDeleted(string name, address user);
    event FollowerAdded(address userAddress, string user, string follower, address followerAddress);
    event Unfollowed(string user, string follower);
    event TweetCreated(uint256 id, address creator, string name, string content, string[] comments, address[] likes, uint256[] tips, bool exists, string imageUrl, uint256 timestamp);
    event CommentAdded(uint256 tweetId, string comment, address commenter, string commenterName, string profilePic, uint256 timestamp);
    event TweetLiked(uint256 tweetId, address liker);
    event UserTipped(uint256 amount, uint256 tweetId, address creator, address tipper, string tipperName);
    event TwitterReceivedFunds(address contractFrom, uint256 contractFromAmount);
    event FundsWithdrawn(address destinationWallet, uint256 balance);
    event TweetTokenBought(uint256 maticSent, uint256 tokensGiven, address buyersAddress, uint256 buyersNewBalance);

    function depositMatic() payable public {
        balances[MATIC][msg.sender] += msg.value;
        emit Deposit(MATIC, msg.sender, msg.value, balances[MATIC][msg.sender]);
    }

    function withdrawMatic(uint _amount) public {
        require(balances[MATIC][msg.sender] >= _amount);
        balances[MATIC][msg.sender] -= _amount;
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed.");
        emit Withdraw(MATIC, msg.sender, _amount, balances[MATIC][msg.sender]);
    }

    function depositTweetToken(address _token, uint256 _amount) public {
        require(_token != MATIC);
        require(TweetToken(_token).transferFrom(msg.sender, address(this), _amount));
        balances[_token][msg.sender] += _amount; 
        emit Deposit(_token, msg.sender, _amount, balances[_token][msg.sender]);
    }

    function withdrawTweetToken(address _token, uint256 _amount) public {
        require(_token != address(0));
        require(balances[_token][msg.sender] >= _amount);
        balances[_token][msg.sender] -= _amount;
        require(TweetToken(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, balances[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return balances[_token][_user];
    }

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
        return following[follower][user];
    }

    function getFollowerIndex(address user, address follower) public view returns (uint) {
        return followerIndices[user][follower];
    }

    function becomeFollower(address user, address follower) public {
        require(msg.sender == follower, "User Cannot Force Followers");
        require(users[user].exists, "User does not exist");
        require(users[follower].exists, "Follower does not exist");
        require(!following[follower][user], "Not following");

        followers[user].push(follower); // add follower to followers array for that user
        uint256 index = followers[user].length - 1; // get index for follower
        following[follower][user] = true; // set following status to true
        followerIndices[user][follower] = index; // store index for follower

        emit FollowerAdded(users[user].userAddress, users[user].name, users[follower].name, users[follower].userAddress);
    }

    function unfollow(address _user, address _follower) public {
        require(msg.sender == _follower, "Only the follower can remove themselves");
        require(following[_follower][_user], "Not following");

        uint256 index = followerIndices[_user][_follower];
        uint256 lastIndex = followers[_user].length - 1;

        // Move the last follower to the index of the follower being removed
        followers[_user][index] = followers[_user][lastIndex];

        // Update the index of the moved follower
        followerIndices[_user][followers[_user][index]] = index;

        // Remove the last follower and update the following mapping
        followers[_user].pop();
        following[_follower][_user] = false;
        delete followerIndices[_user][_follower];

        require(!following[_user][_follower], "Failed to remove the follower");


        emit Unfollowed(users[_user].name, users[_follower].name);
    }

    function getFollowerAddresses(address user) public view returns (address[] memory) {
        require(users[user].exists, "User does not exist");
        return followers[user];
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
        require(tweetToken.transferFrom(msg.sender, tweets[_tweetId].creator, _amount));
        tweets[_tweetId].tips.push(_amount);

        emit UserTipped(_amount, _tweetId, tweets[_tweetId].creator, msg.sender, users[msg.sender].name);
    }

    function receiveFunds() external payable {
        // Funds will be received and stored in the contract
        emit TwitterReceivedFunds(msg.sender, msg.value);
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw funds");
        payable(owner).transfer(address(this).balance);

        emit FundsWithdrawn(msg.sender, address(this).balance);
    }

    function buyTweetTokens() external payable {
        require(msg.value > 0, "You must send some MATIC to buy tokens");

        uint256 tokenGet = msg.value * conversionRate;
        require(tweetToken.balanceOf(address(this)) >= tokenGet, "Insufficient Tweet Tokens available");

        tweetToken.transfer(msg.sender, tokenGet);
        uint256 buyersNewBalance = tweetToken.balanceOf(msg.sender);

        emit TweetTokenBought(msg.value, tokenGet, msg.sender, buyersNewBalance);
    }
}