const { assert, expect } = require('chai');
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

	describe('Minting & Auction', () => {
		describe('Success', () => {
			it('allows the user to mint a new tweet nft', async () => {
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

			it('allows the user to create an auction for their nft', async () => {
				const mint = await nft.mintTweetNFT(user1, { from: owner });
				const mintLog = mint.logs[0];
				const mintEvent = mintLog.args;
				const auction = await nft.createAuction(mintEvent.tokenId, 10, 10, { from: user1 });
				const event = auction.logs[1].args;
				// check event output
				event.originalOwner.should.equal(user1);
				event.seller.should.equal(user1);
				event.nftId.toString().should.equal('0');
				event.startingPrice.toString().should.equal('10');
				event.auctionDuration.toString().should.equal('10');
				event.twitterContract.should.equal(twitter.address);
			});

			it('should set the base URI', async () => {
				const newBaseURI = 'https://example.com/';
				await nft.setBaseURI(newBaseURI, { from: owner });
				const baseURI = await nft.baseURI();
				baseURI.should.equal(newBaseURI);
			});

			it('should return the correct token URI', async () => {
				const baseURI = 'https://ipfs.io/ipfs/';
				const token = await nft.mintTweetNFT(user1, { from: user1 });
				const id = token.logs[1].args.nftId;
				const tokenURI = await nft.tokenURI(id);
				tokenURI.should.equal(baseURI + id.toString());
			});

			it('should set the Twitter contract address', async () => {
				const storedAddress = await nft.getTwitterContractAddress();
				storedAddress.should.equal(twitter.address);
			});
		});

		describe('Failure', () => {
			it('should now allow auction creation for nft that does not exist', async () => {
				await nft.mintTweetNFT(user1, { from: user1 });
				await nft.createAuction(5, 10, 10, { from: user1 }).should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('should not allow auction call by user who is not the owner of the nft', async () => {
				await nft.mintTweetNFT(user1, { from: user1 });
				await nft.createAuction(1, 10, 10, { from: user2 }).should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('should not allow setting the Twitter contract address twice', async () => {
				const twitterContractAddress = user1; // Use user1's address as an example
				await nft
					.setTwitterContractAddress(twitterContractAddress, { from: owner })
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});
		});
	});
});
