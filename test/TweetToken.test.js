const helpers = require('./helpers');
require('chai').use(require('chai-as-promised')).should();
const TweetToken = artifacts.require('./TweetToken');

contract('TweetToken', ([owner, user1, user2]) => {
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

	describe('Transactions', () => {
		let amount;

		beforeEach(async () => {
			amount = web3.utils.toWei('1', 'ether');
		});

		it('should transfer tokens between accounts', async () => {
			const transfer = await tweetToken.transfer(user2, amount, { from: owner });
			const user2Balance = await tweetToken.getBalanceOf(user2);

			user2Balance.toString().should.equal(amount.toString());
		});

		it('should fail if sender doesn’t have enough tokens', async () => {
			const initialUserBalance = await tweetToken.getBalanceOf(user1);

			await tweetToken
				.transfer(user2, web3.utils.toWei('2', 'ether'), { from: user1 })
				.should.be.rejectedWith(helpers.EVM_REVERT);

			const finalUserBalance = await tweetToken.getBalanceOf(user1);
			expect(finalUserBalance.toString()).to.equal(initialUserBalance.toString());
		});

		it('should update allowances', async () => {
			await tweetToken.approve(user1, amount);
			const allowance = await tweetToken.getAllowance(owner, user1);

			allowance.toString().should.equal(amount.toString());
		});

		it('should transfer from one account to another', async () => {
			await tweetToken.approve(owner, amount);
			await tweetToken.transferFrom(owner, user1, amount);

			const user1Balance = await tweetToken.getBalanceOf(user1);
			user1Balance.toString().should.equal(amount.toString());
		});

		it('should fail if sender doesn’t have enough allowance', async () => {
			await tweetToken.approve(user1, web3.utils.toWei('1', 'ether'));

			await tweetToken
				.transferFrom(user1, owner, web3.utils.toWei('2', 'ether'))
				.should.be.rejectedWith(helpers.EVM_REVERT);
		});

		it('should emit Approval event', async () => {
			const approve = await tweetToken.approve(user1, amount);
			const log = approve.logs[0];
			const event = log.args;
			event.owner.should.equal(owner);
			event.spender.should.equal(user1);
			event.value.toString().should.equal(amount.toString());
		});

		it('should emit Transfer event', async () => {
			const transfer = await tweetToken.transfer(user1, amount);
			const log = transfer.logs[0];
			const event = log.args;
			event.from.should.equal(owner);
			event.to.should.equal(user1);
			event.value.toString().should.equal(amount.toString());
		});
	});
});
