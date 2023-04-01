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
        Auction newAuction = new Auction(originalOwner, payable(msg.sender), _nftIDs.current(), _startingPrice, _auctionDuration, address(this), twitterContractAddress);
        _approve(address(newAuction), _nftIDs.current());
    }

    function mintTweetNFT(address payable owner) public returns (uint256) {
        uint256 nftId = _nftIDs.current();

        // Only 1 mint per tweet
        require(!_tweetMinted[nftId], "Tweet has already been minted");
    
        _mint(owner, nftId);

        // Create the full tokenURI
        string memory fullURI = string(abi.encodePacked(baseURI, uintToString(nftId)));
        _setTokenURI(nftId, fullURI);

        _tweetMinted[nftId] = true;
        _originalOwners[nftId] = owner;

        _nftIDs.increment();

        return nftId;
    }

    // Helper functions
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 temp = value;
        uint256 digits;

        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);

        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        
        return string(buffer);
}
}