const { time } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect, assert } = require('chai');
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
	let nftId;

	beforeEach(async () => {
		// Initialize contracts
		tweetToken = await TweetToken.new();
		nft = await TweetNFT.new();
		twitter = await Twitter.new(owner, tweetToken.address, nft.address);
		// Mint NFT
		nftId = await nft.mintTweetNFT(owner, { from: owner });
		// Initialize auction
		auction = await Auction.new(owner, owner, 0, web3.utils.toWei('1', 'ether'), 3600, nft.address, twitter.address);
		// Approve auction contract to transfer nft ownership
		await nft.approve(auction.address, 0, { from: owner });
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

			it('does now allow bids after the auction end time', async () => {
				await time.increase(time.duration.hours(1));
				await auction.endAuction({ from: owner });
				await auction
					.bid({ from: user1, value: web3.utils.toWei('2', 'ether') })
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});
		});
	});

	describe('Ending Auction', () => {
		describe('Success', () => {
			it('updates balances of seller & twitter contract successfully', async () => {
				// Get initial balances
				let initialOriginalOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));
				let initialTwitterContractBalance = web3.utils.toBN(await web3.eth.getBalance(twitter.address));

				// Bid
				await auction.bid({ from: user1, value: web3.utils.toWei('2', 'ether') });

				// End the auction
				await time.increase(time.duration.hours(1));
				const event = await auction.endAuction({ from: owner });

				// Get transaction hash and fetch receipt to get gas
				const txHash = event.tx;
				const receipt = await web3.eth.getTransactionReceipt(txHash);

				// Fetch gas used and calculate price
				const gasUsed = web3.utils.toBN(receipt.gasUsed);
				const gasPrice = web3.utils.toBN(await web3.eth.getGasPrice());
				const gasFee = gasUsed.mul(gasPrice);

				// Calculate the expected additions and deductions for each account
				let royaltyAmount = web3.utils.toBN(event.logs[0].args.royaltyAmount);
				let twitterFee = web3.utils.toBN(event.logs[0].args.twitterFee);
				let sellerShare = web3.utils.toBN(event.logs[0].args.sellerShare);

				// Get final balances
				let finalOriginalOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(owner));
				let finalTwitterContractBalance = web3.utils.toBN(await web3.eth.getBalance(twitter.address));

				// Check if balances are updated correctly
				expect(finalOriginalOwnerBalance.toString()).to.eql(
					initialOriginalOwnerBalance.add(sellerShare).add(royaltyAmount).sub(gasFee).toString(),
				);
				expect(finalTwitterContractBalance.toString()).to.eql(initialTwitterContractBalance.add(twitterFee).toString());
			});

			it('transfers nft ownership to highest bidder', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('2', 'ether') });
				await time.increase(time.duration.hours(1));
				const event = await auction.endAuction({ from: owner });
				const highestBidder = event.logs[0].args.winner;
				const newOwner = await nft.ownerOf(0);
				highestBidder.should.equal(newOwner);
			});

			it('declares auction as ended', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('2', 'ether') });
				await time.increase(time.duration.hours(1));
				await auction.endAuction({ from: owner });
				const ended = await auction.getEnded();
				assert.isTrue(ended);
			});

			it('emits an AuctionEnded event', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('2', 'ether') });
				await time.increase(time.duration.hours(1));
				const event = await auction.endAuction({ from: owner });
				const log = event.logs[0];
				const data = log.args;
				const highestBid = web3.utils.toWei('2', 'ether');
				const royaltyAmount = (web3.utils.toWei('2', 'ether') * 5) / 100;
				const twitterFee = (web3.utils.toWei('2', 'ether') * 5) / 100;
				log.event.should.eq('AuctionEnded');
				data.winner.should.equal(user1);
				data.amount.toString().should.equal(web3.utils.toWei('2', 'ether').toString());
				data.royaltyAmount.toString().should.equal(((highestBid * 5) / 100).toString());
				data.twitterFee.toString().should.equal(((highestBid * 5) / 100).toString());
				data.sellerShare.toString().should.equal((highestBid - royaltyAmount - twitterFee).toString());
			});
		});

		describe('Failure', () => {
			it('only allows nft seller to end auction', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('2', 'ether') });
				await time.increase(time.duration.hours(1));
				await auction.endAuction({ from: user2 }).should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('only allows the auction to be ended at or after the specified end time', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('2', 'ether') });
				await auction.endAuction({ from: owner }).should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('only allows auction to be ended if it is in progress', async () => {
				await auction.bid({ from: user1, value: web3.utils.toWei('2', 'ether') });
				await time.increase(time.duration.hours(1));
				await auction.endAuction({ from: owner });
				await auction.endAuction({ from: user1 }).should.be.rejectedWith(helpers.EVM_REVERT);
			});
		});
	});
});
