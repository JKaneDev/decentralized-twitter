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
    mapping(uint256 => bool) private _tweetMinted;
    // Store the owner of each nft URI
    mapping(uint256 => address) private _originalOwners;
    // Twitter contract
    address twitterContractAddress;
    // Track if the Twitter contract address has been set
    bool private twitterContractSet;
    // Base URI for nft
    string public baseURI;

    constructor() ERC721("TweetNFT", "TWNFT") {}
    
    event NFTMinted(uint256 nftId, address owner, uint256 tweetId, string fullUri, string imageURI, string htmlURI, uint256 timestamp);
    event AuctionCreated(address originalOwner, address seller, uint256 nftId, uint256 startingPrice, uint256 auctionDuration, address twitterContract);

    function isTweetMinted(uint256 nftId) public view returns (bool) {
        return _tweetMinted[nftId];
    }

    function getOriginalOwner(uint256 nftId) public view returns (address) {
        return _originalOwners[nftId];
    }

    function getTwitterContractAddress() public view returns (address) {
        return twitterContractAddress;
    }

    function setBaseURI(string memory _baseURI) external {
        baseURI = _baseURI;
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        _burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function setTwitterContractAddress(address _twitterContractAddress) external {
        require(!twitterContractSet, "Twitter contract address has already been set");
        twitterContractAddress = _twitterContractAddress;
        twitterContractSet = true;
    }

    function createAuction(uint256 _nftId, uint256 _startingPrice, uint256 _auctionDuration) external {
        require(_exists(_nftId), "NFT does not exist");
        require(ownerOf(_nftId) == msg.sender, "Caller is not the owner of the NFT");
        address payable originalOwner = payable(_originalOwners[_nftId]);
        Auction newAuction = new Auction(originalOwner, payable(msg.sender), _nftId, _startingPrice, _auctionDuration, address(this), twitterContractAddress);
        _approve(address(newAuction), _nftId);

        emit AuctionCreated(originalOwner, msg.sender, _nftId, _startingPrice, _auctionDuration, twitterContractAddress);
    }


    function mintTweetNFT(address payable owner, uint256 tweetId, string memory metadataURI, string memory imageURI, string memory htmlURI) public returns (uint256) {
        uint256 nftId = _nftIDs.current();

        // Only 1 mint per tweet
        require(!_tweetMinted[tweetId], "Tweet has already been minted");
    
        _mint(owner, nftId);

        // Create the full tokenURI
        _setTokenURI(nftId, metadataURI);

        _tweetMinted[tweetId] = true;
        _originalOwners[nftId] = owner;

        _nftIDs.increment();

        emit NFTMinted(nftId, owner, tweetId, metadataURI, imageURI, htmlURI, block.timestamp);

        return nftId;
    }
}