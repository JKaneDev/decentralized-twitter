const { tokens } = require('../test/helpers');

const Twitter = artifacts.require('Twitter');
const TweetToken = artifacts.require('TweetToken');
const TweetNFT = artifacts.require('TweetNFT');

module.exports = async function (deployer) {
	try {
		const accounts = await web3.eth.getAccounts();
		const owner = accounts[0];

		await deployer.deploy(TweetToken);
		const tweetTokenInstance = await TweetToken.deployed();

		await deployer.deploy(TweetNFT);
		const tweetNFTInstance = await TweetNFT.deployed();
		await tweetNFTInstance.setBaseURI('https://ipfs.io/ipfs/');

		const tweetTokenAddress = tweetTokenInstance.address;
		const tweetNFTAddress = tweetNFTInstance.address;

		await deployer.deploy(Twitter, owner, tweetTokenAddress, tweetNFTAddress);
		const twitterInstance = await Twitter.deployed();
		const twitterAddress = twitterInstance.address;

		let amount = tokens(500000); // half total supply

		await tweetTokenInstance.approve(twitterAddress, amount);

		await tweetTokenInstance.transfer(twitterAddress, amount, { from: owner });

		await tweetNFTInstance.setTwitterContractAddress(twitterAddress);
	} catch (error) {
		console.error('Error during deployment:', error);
	}
};
