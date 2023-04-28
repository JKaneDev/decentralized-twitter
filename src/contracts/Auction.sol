// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./TweetNFT.sol";
import './Twitter.sol';

contract Auction is ReentrancyGuard {
    Twitter public twitterContract;

    address payable public originalOwner;
    address payable public seller;
    uint256 public royaltyPercentage = 5;

    TweetNFT private nftContract;
    address public nftContractAddress;
    uint256 public nftId;

    uint256 public startingPrice;
    uint256 public auctionEndTime;
    address payable public highestBidder;
    uint256 public highestBid;

    bool public ended;

    event HighestBidIncreased(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 amount, uint256 royaltyAmount, uint256 twitterFee, uint256 sellerShare);

    constructor(
        address payable _originalOwner, 
        address payable _seller, 
        uint256 _nftId, 
        uint256 _startingPrice,
        uint256 _auctionDuration, 
        address _nftContractAddress,
        address _twitterContractAddress
        ) {
            originalOwner = _originalOwner;
            seller = _seller;
            nftId = _nftId;
            startingPrice = _startingPrice;
            auctionEndTime = block.timestamp + _auctionDuration;
            nftContractAddress = _nftContractAddress;
            nftContract = TweetNFT(_nftContractAddress);
            twitterContract = Twitter(_twitterContractAddress);
    }

    function getStartingPrice() public view returns (uint256) {
        return startingPrice;
    }

    function getAuctionEndTime() public view returns (uint256) {
        return auctionEndTime;
    }

    function getHighestBidder() public view returns (address payable) {
        return highestBidder;
    }

    function getHighestBid() public view returns (uint256) {
        return highestBid;
    }

    function getEnded() public view returns (bool) {
        return ended;
    }

    function bid() public payable nonReentrant {
        require(msg.sender != seller, "Tweet owner cannot bid on their own auction");
        require(msg.value >= startingPrice, "Bid should be equal or greater than starting price");
        require(msg.sender != highestBidder, "You are already the highest bidder");
        require(msg.value > highestBid, "There already is a higher bid, increase bid amount");
        require(block.timestamp <= auctionEndTime, "Auction already ended");

        if (highestBid != 0) {
            highestBidder.transfer(highestBid);
        }

        highestBidder = payable(msg.sender);
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function endAuction() public nonReentrant {
        require(msg.sender == seller, "Only seller can end auction");
        require(block.timestamp >= auctionEndTime, "Auction has not ended");
        require(!ended, "Auction has already been called");
        
        uint256 twitterFee = (highestBid * 5) / 100;
        uint256 royaltyAmount = (highestBid * royaltyPercentage) / 100;
        uint256 sellerShare = highestBid - royaltyAmount - twitterFee;

        if (originalOwner == seller) {
            originalOwner.transfer(sellerShare + royaltyAmount);
            twitterContract.receiveFunds{value: twitterFee}();
        } else {
            originalOwner.transfer(royaltyAmount);
            seller.transfer(sellerShare);
            twitterContract.receiveFunds{value: twitterFee}();
        }
        // Transfer NFT ownership to highest bidder
        if (highestBid >= startingPrice) {
            nftContract.safeTransferFrom(seller, highestBidder, nftId);
        } else {
            ended = true;
            return;
        }
            

        ended = true;
        emit AuctionEnded(highestBidder, highestBid, royaltyAmount, twitterFee, sellerShare);
    }
}
