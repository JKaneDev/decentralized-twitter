// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import './Auction.sol';

contract TweetNFT is ERC721, ERC721URIStorage {


    using Counters for Counters.Counter;
    Counters.Counter private _nftIDs;
    // Keep track of which tweets have already been minted
    mapping(string => bool) private _tweetMinted;
    // Store the owner of each tweet URI
    mapping(string => address) private _originalOwners;
    // Twitter contract
    address twitterContractAddress;
    // Track if the Twitter contract address has been set
    bool private twitterContractSet;

    constructor() ERC721("TweetNFT", "TWNFT") {}

    function setTwitterContractAddress(address _twitterContractAddress) external {
        require(!twitterContractSet, "Twitter contract address has already been set");
        twitterContractAddress = _twitterContractAddress;
        twitterContractSet = true;
    }

    function createAuction(uint256 _nftId, uint256 _startingPrice, uint256 _auctionDuration) external {
        require(_isApprovedOrOwner(msg.sender, _nftId), "Caller is not owner nor approved");
        Auction newAuction = new Auction(payable(_originalOwners[_nftId]), payable(msg.sender), _nftId, _startingPrice, _auctionDuration, address(this), twitterContractAddress);
        _approve(address(newAuction), _nftId);
    }

    function mintTweetNFT(address payable recipient, string memory tokenURI) public returns (uint256) {
        // Only 1 mint per tweet
        require(!_tweetMinted[tokenURI], "Tweet has already been minted");
    
        _nftIDs.increment();
        uint256 newItemId = _nftIDs.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tweetMinted[tokenURI] = true;
        _originalOwners[tokenURI] = recipient;

        return newItemId;
    }
}