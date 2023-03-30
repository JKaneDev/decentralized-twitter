// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TweetNFT is ERC721, ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    // Keep track of which tweets have already been minted
    mapping(string => bool) private _tweetMinted;
    // Store the owner of each tweet URI
    mapping(string => address) private _tweetOwners;

    constructor() ERC721("TweetNFT", "TWNFT") {}

    function mintTweetNFT(address payable recipient, string memory tokenURI, uint256 price) public returns (uint256) {
        // Only 1 mint per tweet
        require(!_tweetMinted[tokenURI], "Tweet has already been minted");
    
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tweetMinted[tokenURI] = true;
        _tokenOwners[tokenURI] = recipient;

        // Create a new auction for the NFT
        Auction newAuction = new Auction(recipient, newItemId, price, auctionDuration, address(this));
        // Approve the auction contract to manage the NFT
        _approve(address(newAuction), newItemId);

        return newItemId;
    }
}