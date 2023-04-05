const { time } = require('@openzeppelin/test-helpers');
const helpers = require('./helpers');
require('chai').use(require('chai-as-promised')).should();
const TweetToken = artifacts.require('./TweetToken');
const TweetNFT = artifacts.require('./TweetNFT');
const Auction = artifacts.require('./Auction');
const Twitter = artifacts.require('./Twitter');

contract('Auction', ([owner, user1, user2]) => {
	let tweetToken;
	let nft;
	let twitter;
	let auction;
	let startTime;

	beforeEach(async () => {
		// Initialize contracts
		tweetToken = await TweetToken.new();
		nft = await TweetNFT.new();
		twitter = await Twitter.new(owner, tweetToken.address, nft.address);
		// Mint NFT
		await nft.mintTweetNFT(owner, { from: owner });
		// Initialize auction
		auction = await Auction.new(owner, owner, 0, web3.utils.toWei('1', 'ether'), 3600, nft.address, twitter.address);
		startTime = await time.latest();
	});

	describe('Bidding', () => {
		describe('Success', () => {
			it('updates the highest bidder after each bid', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('1', 'ether') });
				const highestBidder = await auction.getHighestBidder();
				highestBidder.should.equal(user1);
			});

			it('updates the highest bid after each bid', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('1', 'ether') });
				const highestBid = await auction.getHighestBid();
				highestBid.toString().should.equal(web3.utils.toWei('1', 'ether').toString());
			});

			it('emits a "HighestBidIncreased Event"', async () => {
				const bid = await auction.bid({ from: user1, value: web3.utils.toWei('1', 'ether') });
				const log = bid.logs[0];
				const event = log.args;
				log.event.should.equal('HighestBidIncreased');
				event.bidder.should.equal(user1);
				event.amount.toString().should.equal(web3.utils.toWei('1', 'ether').toString());
			});
		});

		describe('Failure', () => {
			it('does not allow seller to bid on their own auction', async () => {
				await auction
					.bid({ from: owner, value: web3.utils.toWei('1', 'ether') })
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('does not allow a bid under the starting price', async () => {
				await auction
					.bid({ from: user1, value: web3.utils.toWei('0.5', 'ether') })
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('does not allow consecutive bids from same user', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('1', 'ether') });
				await auction
					.bid({ from: user1, value: web3.utils.toWei('1', 'ether') })
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('does not allow bids less than current bid', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('1', 'ether') });
				await auction
					.bid({ from: user2, value: web3.utils.toWei('0.5', 'ether') })
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it.only('does now allow bids after the auction end time', async () => {
				await time.increase(time.duration.hours(1));
				await auction
					.bid({ from: user1, value: web3.utils.toWei('2', 'ether') })
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});
		});
	});

	describe('Ending Auction', () => {
		describe('Success', () => {
			it('transfers royalty to the original owner', async () => {});

			it('transfers sale share to seller', async () => {});

			it('transfers sale fee to twitter contract', async () => {});

			it('transfers nft ownership to highest bidder', async () => {});

			it('declares auction as ended', async () => {});

			it('emits an AuctionEnded event', async () => {});
		});

		describe('Failure', () => {
			it('only allows nft seller to end auction', async () => {});

			it('only allows the auction to be ended at or after the specified end time', async () => {});

			it('only allows auction to be ended if it is in progress', async () => {});
		});
	});
});
