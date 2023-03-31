require('chai').use(require('chai-as-promised')).should();
const Twitter = artifacts.require('./Twitter');
const TweetToken = artifacts.require('./TweetToken');
const TweetNFT = artifacts.require('./TweetNFT');

contract('Twitter', ([deployer]) => {
	let contract;
	let tweetToken;
	let nft;

	beforeEach(async () => {
		contract = await Twitter.new();
		tweetToken = await TweetToken.new();
		nft = await TweetNFT.new();
	});

	describe('deployment', () => {});
});
