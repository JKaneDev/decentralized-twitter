const Twitter = artifacts.require('Twitter');
const TweetToken = artifacts.require('TweetToken');
const TweetNFT = artifacts.require('TweetNFT');
const Auction = artifacts.require('Auction');

module.exports = async function (deployer) {
	const accounts = await web3.eth.getAccounts();
	const owner = accounts[0];

	await deployer.deploy(TweetToken);
	const tweetTokenInstance = await TweetToken.deployed();
	console.log('Tweet Token Instance: ', tweetTokenInstance.address);

	await deployer.deploy(TweetNFT);
	const tweetNFTInstance = await TweetNFT.deployed();
	console.log('Tweet NFT Instance: ', tweetNFTInstance.address);

	const tweetTokenAddress = tweetTokenInstance.address;
	const tweetNFTAddress = tweetNFTInstance.address;

	await deployer.deploy(Twitter, owner, tweetTokenAddress, tweetNFTAddress);
	const twitterInstance = await Twitter.deployed();
	const twitterAddress = twitterInstance.address;
	console.log('Twitter Instance: ', twitterAddress);

	await tweetNFTInstance.setTwitterContractAddress(twitterAddress);
};
