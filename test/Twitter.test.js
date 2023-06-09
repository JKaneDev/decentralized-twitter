const { assert, expect } = require('chai');
const helpers = require('./helpers');
require('chai').use(require('chai-as-promised')).should();
const Twitter = artifacts.require('./Twitter');
const TweetToken = artifacts.require('./TweetToken');
const TweetNFT = artifacts.require('./TweetNFT');

contract('Twitter', (accounts) => {
	let twitter;
	let tweetToken;
	let nft;
	let owner;
	let user1;
	let user2;

	beforeEach(async () => {
		owner = accounts[0];
		user1 = accounts[1];
		user2 = accounts[2];
		tweetToken = await TweetToken.new();
		nft = await TweetNFT.new();
		twitter = await Twitter.new(owner, tweetToken.address, nft.address);
		await nft.setTwitterContractAddress(twitter.address);

		tweetToken.transfer(user1, helpers.tokens(100), { from: owner });
		tweetToken.transfer(user2, helpers.tokens(100), { from: owner });
	});

	describe('Deployment', () => {
		it('tracks the twitter contract owner', async () => {
			const result = await twitter.owner();
			result.should.equal(owner);
		});

		it('tracks the tweet token contract address', async () => {
			const result = await twitter.tweetToken();
			result.should.equal(tweetToken.address);
		});

		it('tracks the nft contract address', async () => {
			const result = await twitter.tweetNFT();
			result.should.equal(nft.address);
		});
	});

	describe('Creating, Removing & Editing User Accounts', () => {
		let result;
		let log;
		let event;

		beforeEach(async () => {
			result = await twitter.createAccount(
				'jtkanedev',
				'26 Year Old Ethereum DApp Developer From The UK.',
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
				{ from: user1 },
			);
			log = result.logs[0];
			event = log.args;
		});

		it('Disallows user from creating another account with the same wallet', async () => {
			await twitter
				.createAccount(
					'jtkanedev',
					'26 Year Old Ethereum DApp Developer From The UK.',
					'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
					{ from: user1 },
				)
				.should.be.rejectedWith(helpers.EVM_REVERT);
		});

		it('Successfully creates a user ID', () => {
			log.event.should.eq('AccountCreated');
			event.id.toString().should.equal('0');
		});

		it('Successfully creates a username', () => {
			event.name.should.equal('jtkanedev');
		});

		it('Successfully creates a user bio', () => {
			event.bio.should.equal('26 Year Old Ethereum DApp Developer From The UK.');
		});

		it('Successfully generates a profile picture URL', () => {
			event.profilePictureURL.should.equal(
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
			);
		});
	});

	describe('Creating Tweets, Re-Tweeting & Liking Tweets', () => {
		let user1Account;
		let user2Account;

		beforeEach(async () => {
			// Create First Account
			user1Account = await twitter.createAccount(
				'jtkanedev',
				'26 Year Old Ethereum DApp Developer From The UK.',
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
				{ from: user1 },
			);

			// Create Second Account
			user2Account = await twitter.createAccount(
				'Heraclitus',
				'Greek Philosopher from the 5th - 6th Century BC. "You Cannot Step Into The Same River Twice"',
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
				{ from: user2 },
			);

			// User2 follows user1
			await twitter.becomeFollower(user1, user2, { from: user2 });
		});

		describe('Success', () => {
			it('allows user to create a tweet', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				let tweet = await twitter.getTweet(id);
				tweet.id.toString().should.equal(id.toString());
				tweet.creator.toString().should.equal(user1.toString());
				tweet.content.should.equal('Hello everyone! Good to be here :)');
			});

			it('emits a Tweet event', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				event.id.toString().should.equal(id.toString());
				event.creator.toString().should.equal(user1.toString());
				event.content.should.equal('Hello everyone! Good to be here :)');
				event.likes.length.toString().should.equal('0');
				expect(event.tips.length).to.equal(0);
				assert.isTrue(event.exists);
				event.imageUrl.should.equal('https://tweetimageurl.com');
			});

			it('allows user to like a tweet', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				await twitter.likeTweet(id);
				let tweet = await twitter.getTweet(id);
				tweet.likes.length.toString().should.equal('1');
			});

			it('emits a TweetLiked event', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				let like = await twitter.likeTweet(id, { from: user1 });
				let likeLog = like.logs[0];
				let likeEvent = likeLog.args;
				likeEvent.tweetId.toString().should.equal(id.toString());
				likeEvent.liker.toString().should.equal(user1.toString());
			});
		});

		describe('Failure', () => {
			it('does not allow non-users to tweet', async () => {
				await twitter
					.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
						from: owner,
					})
					.should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('does not allow the user to like the same tweet more than once', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				let like = await twitter.likeTweet(id);
				await twitter.likeTweet(id).should.be.rejectedWith(helpers.EVM_REVERT);
			});
		});
	});

	describe('User can tip & receive tips on tweets', () => {
		let result;
		let log;
		let event;
		let id;
		beforeEach(async () => {
			// Create First Account
			user1Account = await twitter.createAccount(
				'jtkanedev',
				'26 Year Old Ethereum DApp Developer From The UK.',
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
				{ from: user1 },
			);

			// Create Second Account
			user2Account = await twitter.createAccount(
				'Heraclitus',
				'Greek Philosopher from the 5th - 6th Century BC. "You Cannot Step Into The Same River Twice"',
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
				{ from: user2 },
			);

			// User2 follows user1
			await twitter.becomeFollower(user1, user2, { from: user2 });

			// Create Tweet & get ID
			result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
				from: user1,
			});
			log = result.logs[0];
			event = log.args;
			id = event.id;
		});

		describe('Success', () => {
			it('allows the user to tip another user with tweetToken', async () => {
				await tweetToken.approve(twitter.address, 100, { from: user2 });
				await twitter.tipUser(1, 10, { from: user2 });
				let tweet = await twitter.getTweet(id);
				assert.include(tweet.tips, '10');
				tweet.tips.length.toString().should.equal('1');
			});

			it('emits a UserTipped event', async () => {
				await tweetToken.approve(twitter.address, 100, { from: user2 });
				let tip = await twitter.tipUser(1, 10, { from: user2 });
				let tipLog = tip.logs[0];
				let tipEvent = tipLog.args;
				tipEvent.amount.toString().should.equal('10');
				tipEvent.tweetId.toString().should.equal('1');
				tipEvent.creator.should.equal(user1);
				tipEvent.tipper.should.equal(user2);
				tipEvent.tipperName.should.equal('Heraclitus');
			});
		});

		describe('Failure', () => {
			it('disallows unapproved users from tipping', async () => {
				await tweetToken.approve(twitter.address, 100, { from: user1 });
				await twitter.tipUser(1, 10, { from: user2 }).should.be.rejectedWith(helpers.EVM_REVERT);
			});

			it('users must tip more than 0', async () => {
				await tweetToken.approve(twitter.address, 100, { from: user2 });
				await twitter.tipUser(1, 0, { from: user2 }).should.be.rejectedWith(helpers.EVM_REVERT);
			});
		});
	});

	describe('Twitter contract can receive ETH & contract deployer can withdraw', () => {
		it('should receive ETH and contract deployer can withdraw', async () => {
			// Send 1 Ether to user1
			await web3.eth.sendTransaction({
				from: owner,
				to: user1,
				value: web3.utils.toWei('1', 'ether'),
			});

			// Send 0.5 Ether back to the contract
			await twitter.receiveFunds({
				from: user1,
				to: twitter.address,
				value: web3.utils.toWei('0.5', 'ether'),
			});

			// Check the contract's balance
			const contractBalance = await web3.eth.getBalance(twitter.address);
			assert.equal(contractBalance, web3.utils.toWei('0.5', 'ether'));

			// Withdraw funds to the contract deployer's account
			const initialBalance = await web3.eth.getBalance(owner);
			const withdrawReceipt = await twitter.withdraw({ from: owner });
			const gasUsed = withdrawReceipt.receipt.gasUsed;
			const tx = await web3.eth.getTransaction(withdrawReceipt.tx);
			const gasPrice = tx.gasPrice;
			const gasCost = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));
			const finalBalance = await web3.eth.getBalance(owner);

			// Check that the contract deployer received the correct amount of Ether
			const expectedBalance = new web3.utils.BN(initialBalance)
				.add(new web3.utils.BN(web3.utils.toWei('0.5', 'ether')))
				.sub(gasCost);
			assert.equal(finalBalance.toString(), expectedBalance.toString());
		});
	});
});
