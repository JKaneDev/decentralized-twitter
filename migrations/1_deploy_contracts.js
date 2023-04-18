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
	console.log('Tweet Token Instance: ', tweetTokenInstance.address);

	const testTokens = web3.utils.toWei('1', 'ether');
	await tweetTokenInstance.transfer(user1, testTokens, { from: owner });
	await tweetTokenInstance.transfer(user2, testTokens, { from: owner });
	const ownerBalance = await tweetTokenInstance.getBalanceOf(owner);
	const user1Balance = await tweetTokenInstance.getBalanceOf(user1);
	const user2Balance = await tweetTokenInstance.getBalanceOf(user2);

	console.log(`Allocated ${testTokens} tokens to user1, user2`);
	console.log(`Owner Tweet Token Balance is: ${ownerBalance}`);
	console.log(`user1 Tweet Token Balance is: ${user1Balance}`);
	console.log(`user2 Tweet Token Balance is: ${user2Balance}`);

	await deployer.deploy(TweetNFT);
	const tweetNFTInstance = await TweetNFT.deployed();
	console.log('Tweet NFT Instance: ', tweetNFTInstance.address);

	const tweetTokenAddress = tweetTokenInstance.address;
	const tweetNFTAddress = tweetNFTInstance.address;

	await deployer.deploy(Twitter, owner, tweetTokenAddress, tweetNFTAddress);
	const twitterInstance = await Twitter.deployed();
	const twitterAddress = twitterInstance.address;
	console.log('Twitter Instance: ', twitterAddress);

	let amount = web3.utils.toWei('1000', 'ether');
	await tweetTokenInstance.approve(twitterAddress, amount);

	await tweetNFTInstance.setTwitterContractAddress(twitterAddress);
};
