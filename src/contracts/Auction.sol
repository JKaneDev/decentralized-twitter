pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./Twitter.sol";

contract Auction is ReentrancyGuard {
    address payable public tweetOwner;
    uint256 public nftId;
    uint256 public startingPrice;
    uint256 public auctionEndTime;
    address public nftContractAddress;
    Twitter private twitterContract;
    TweetNFT private nftContract;


    address public highestBidder;
    uint256 public highestBid;

    bool public ended;

    event HighestBidIncreased(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 amount);

    constructor(address payable _tweetOwner, uint256 _nftId, uint256 _startingPrice, uint256 _auctionDuration, address _nftContractAddress, address payable _twitterContractAddress) {
        tweetOwner = _tweetOwner;
        nftId = _nftId;
        startingPrice = _startingPrice;
        auctionEndTime = block.timestamp + _auctionDuration;
        nftContractAddress = _nftContractAddress;
        nftContract = _nftContract;
        twitterContractAddress = _twitterContractAddress;
        twitterContract = Twitter(_twitterContractAddress);
    }

    function bid() public payable nonReentrant {
        require(msg.sender != tweetOwner, "Tweet owner cannot bid on their own auction");
        require(msg.value >= startingPrice, "Bid should be equal or greater than starting price");
        require(msg.sender != highestBidder, "You are already the highest bidder");
        require(msg.value > highestBid, "There already is a higher bid, increase bid amount");
        require(block.timestamp <= auctionEndTime, "Auction already ended");

        if (highestBid != 0) {
            highestBid.transfer(highestBid);
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function endAuction() public nonReentrant {
        require(msg.sender == tweetOwner, "Only owner can end auction");
        require(block.timestamp >= auctionEndTime, "Auction has not ended");
        require(!ended, "Auction has already been called");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        uint256 twitterFee = (highestBid * 5) / 100;
        uint256 tweetOwnerShare = highestBid - twitterFee;

        tweetOwner.transfer(highestBid);
        twitterContract.receiveFunds{value: twitterFee}();
        
        nftContract.safeTransferFrom(tweetOwner, highestBidder, nftId);
    }
}