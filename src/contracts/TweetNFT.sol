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

    constructor() ERC721("TweetNFT", "TWNFT") {}

    function mintTweetNFT(address recipient, string memory tokenURI) public returns (uint256) {
        require(!_tweetMinted[tokenURI], "Tweet has already been minted");
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tweetMinted[tokenURI] = true;

        return newItemId;
    }
}
