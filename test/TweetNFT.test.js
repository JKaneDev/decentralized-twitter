const { assert, expect } = require('chai');
const { assetPrefix } = require('../next.config');
const helpers = require('./helpers');
require('chai').use(require('chai-as-promised')).should();
const Twitter = artifacts.require('./Twitter');
const TweetToken = artifacts.require('./TweetToken');
const TweetNFT = artifacts.require('./TweetNFT');
const Auction = artifacts.require('./Auction');

contract('TweetNFT', ([owner, user1, user2]) => {
	let twitter;
	let tweetToken;
	let auction;
	let nft;

	beforeEach(async () => {
		// Initialize Contracts
		tweetToken = await TweetToken.new();
		nft = await TweetNFT.new({ from: owner });
		twitter = await Twitter.new(owner, tweetToken.address, nft.address);
		await nft.setTwitterContractAddress(twitter.address);
		await nft.setBaseURI('https://ipfs.io/ipfs/');
		// Set User Balances
		tweetToken.transfer(user1, helpers.tokens(100), { from: owner });
		tweetToken.transfer(user2, helpers.tokens(100), { from: owner });
	});

	describe('Mint TweetNFT', () => {
		it('mints TweetNFT', async () => {
			const receipt = await nft.mintTweetNFT(user1, { from: owner });
			// Check the emitted event
			const log = receipt.logs[0];
			const event = log.args;
			event.tokenId.toString().should.equal('0');
			event.to.should.equal(user1);

			// Check the NFT ownership
			const nftOwner = await nft.ownerOf(event.tokenId);
			expect(nftOwner).to.equal(user1);

			// Check the NFT token URI
			const tokenURI = await nft.tokenURI(event.tokenId);
			expect(tokenURI).to.equal('https://ipfs.io/ipfs/' + event.tokenId.toString());

			// Check tweet minted status is updated
			const tweetMinted = await nft.isTweetMinted(event.tokenId);
			assert.isTrue(tweetMinted);

			// Check that the original owner is stored
			const originalOwner = await nft.getOriginalOwner(event.tokenId);
			originalOwner.should.equal(user1);
		});
	});
});
