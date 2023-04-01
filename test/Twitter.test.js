require('chai').use(require('chai-as-promised')).should();
const Twitter = artifacts.require('./Twitter');
const TweetToken = artifacts.require('./TweetToken');
const TweetNFT = artifacts.require('./TweetNFT');

contract('Twitter', ([deployer]) => {
	let twitter;
	let tweetToken;
	let nft;

	beforeEach(async () => {
        tweetToken = await TweetToken.new();
		nft = await TweetNFT.new();
		twitter = await Twitter.new(deployer, tweetToken.address, nft.address);
        await nft.setTwitterContractAddress(twitter.address);
	});

	describe('deployment', () => {
        it('tracks the twitter contract owner', () => {
            const result = await twitter.owner();
            result.should.equal(deployer);
        })
    });
});
