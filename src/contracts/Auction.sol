pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./TweetNFT.sol";

contract Auction is ReentrancyGuard {
    address payable public originalOwner;
    address payable public seller;
    uint256 public royaltyPercentage = 5;
    uint256 public nftId;
    uint256 public startingPrice;
    uint256 public auctionEndTime;
    address public nftContractAddress;
    TweetNFT private nftContract;

    mapping(address => uint) public bids; 
    address[] public bidders;
    address public highestBidder;
    uint256 public highestBid;

    bool public ended;

    event HighestBidIncreased(address indexed bidder, uint256 amount);
    event AuctionEnded(address indexed winner, uint256 amount);
    event FundsReturned(address indexed bidder, uint256 amount);


    constructor(
        address payable _originalOwner, 
        address payable _seller, 
        uint256 _nftId, 
        uint256 _startingPrice,
        uint256 _auctionDuration, 
        address _nftContractAddress, 
        ) {
            originalOwner = _originalOwner;
            seller = _seller;
            nftId = _nftId;
            startingPrice = _startingPrice;
            auctionEndTime = block.timestamp + _auctionDuration;
            nftContractAddress = _nftContractAddress;
            nftContract = TweetNFT(_nftContractAddress);
    }

    function bid() public payable nonReentrant {
        require(msg.sender != seller, "Tweet owner cannot bid on their own auction");
        require(msg.value >= startingPrice, "Bid should be equal or greater than starting price");
        require(msg.sender != highestBidder, "You are already the highest bidder");
        require(msg.value > highestBid, "There already is a higher bid, increase bid amount");
        require(block.timestamp <= auctionEndTime, "Auction already ended");

        if (highestBid != 0) {
            highestBid.transfer(highestBid);
        }

        // Add the bidder the bidders if this is their first bid
        if (bids[msg.sender] == 0) {
            bidders.push(msg.sender);
        }

        // Update the bid for this bidder
        bids[msg.sender] = msg.value;

        highestBidder = msg.sender;
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

        originalOwner.transfer(royaltyAmount);
        seller.transfer(sellerShare);
        twitterContract.receiveFunds{value: twitterFee}();
        
        // Transfer NFT ownership to highest bidder
        nftContract.safeTransferFrom(seller, highestBidder, nftId);

        // Return funds to bidders who were outbid
        for (uint i = 0; i < bidders.length; i++) {
            address bidder = bidders[i];
            uint256 bidAmount = bids[bidder];
            // Only return funds if bidder is not highestBidder
            if (bidder != highestBidder && bidAmount > 0) {
                payable(bidder).transfer(bidAmount);
                emit FundsReturned(bidder, bidAmount);
            }
        }


        ended = true;
        emit AuctionEnded(highestBidder, highestBid);
    }
}

// all funds need to be returned to those who bid but didn't have the highest bid at the end of the auction