const { tokens } = require('../test/helpers');

const Twitter = artifacts.require('Twitter');
const TweetToken = artifacts.require('TweetToken');
const TweetNFT = artifacts.require('TweetNFT');
const Auction = artifacts.require('Auction');

module.exports = async function (deployer) {
	const accounts = await web3.eth.getAccounts();
	const owner = accounts[0];
	const user1 = accounts[1];
	const user2 = accounts[2];

	await deployer.deploy(TweetToken);
	const tweetTokenInstance = await TweetToken.deployed();

	const testTokens = web3.utils.toWei('1', 'ether');
	await tweetTokenInstance.transfer(user1, testTokens, { from: owner });
	await tweetTokenInstance.transfer(user2, testTokens, { from: owner });

	await deployer.deploy(TweetNFT);
	const tweetNFTInstance = await TweetNFT.deployed();
	await tweetNFTInstance.setBaseURI('https://ipfs.io/ipfs/');

	const tweetTokenAddress = tweetTokenInstance.address;
	const tweetNFTAddress = tweetNFTInstance.address;

	await deployer.deploy(Twitter, owner, tweetTokenAddress, tweetNFTAddress);
	const twitterInstance = await Twitter.deployed();
	const twitterAddress = twitterInstance.address;

	let amount = tokens(100000);
	console.log('Amount to transfer:', amount.toString());
	await tweetTokenInstance.approve(twitterAddress, amount);

	let ownerBalance = await tweetTokenInstance.balanceOf(owner);
	console.log('Owner balance before transfer:', ownerBalance.toString());

	await tweetTokenInstance.transfer(twitterAddress, amount, { from: owner });
	console.log('Owner balance after transfer:', ownerBalance.toString());

	await tweetNFTInstance.setTwitterContractAddress(twitterAddress);
};
