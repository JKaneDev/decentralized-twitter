const helpers = require('./helpers');
require('chai').use(require('chai-as-promised')).should();
const TweetToken = artifacts.require('./TweetToken');

contract.only('TweetToken', ([owner, user1, user2]) => {
	let tweetToken;

	beforeEach(async () => {
		tweetToken = await TweetToken.new({ from: owner });
	});

	describe('Deployment', () => {
		it('should set the correct name, symbol, and decimals', async () => {
			const name = await tweetToken.getName();
			const symbol = await tweetToken.getSymbol();
			const decimals = await tweetToken.getDecimals();

			name.should.equal('Tweet Token');
			symbol.should.equal('TWEET');
			decimals.toString().should.equal('18');
		});

		it('should assign the total supply of tokens to the contract creator', async () => {
			const totalSupply = await tweetToken.getTotalSupply();
			const ownerBalance = await tweetToken.getBalanceOf(owner);

			ownerBalance.toString().should.equal(totalSupply.toString());
		});
	});
});
