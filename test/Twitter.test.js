const { assert } = require('chai');
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

		it('nft baseURI is IPFS URL', async () => {
			const result = await twitter.baseURI();
			result.should.equal('https://ipfs.io/ipfs/');
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

		it('Deletes a users account', async () => {
			let result = await twitter.removeUser({ from: user1 });
			let log = result.logs[0];
			let event = log.args;
			console.log('Event: ', event);
		});
	});

	describe('Adding, Removing & Fetching Followers', () => {
		let user1Account;
		let user2Account;
		let user1Log;
		let user1Event;
		let user2Log;
		let user2Event;

		beforeEach(async () => {
			// Create First Account
			user1Account = await twitter.createAccount(
				'jtkanedev',
				'26 Year Old Ethereum DApp Developer From The UK.',
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
				{ from: user1 },
			);
			user1Log = user1Account.logs[0];
			user1Event = user1Log.args;

			// Create Second Account
			user2Account = await twitter.createAccount(
				'Heraclitus',
				'Greek Philosopher from the 5th - 6th Century BC. "You Cannot Step Into The Same River Twice"',
				'https://www.dreamstime.com/businessman-icon-image-male-avatar-profile-vector-glasses-beard-hairstyle-image179728610',
				{ from: user2 },
			);
			user2Log = user2Account.logs[0];
			user2Event = user2Log.args;
		});

		describe('Success', () => {
			it('Allows user to follow another user', async () => {
				await twitter.becomeFollower(user1, user2);
				const user1Followers = await twitter.followers(user1, 0);
				assert.include(user1Followers, user2);
			});

			it('updates following status to true', async () => {
				await twitter.becomeFollower(user1, user2);
				const followingStatus = await twitter.isFollowing(user1, user2);
				assert.isTrue(followingStatus);
			});

			it('stores the index of the follower for a specific user', async () => {
				await twitter.becomeFollower(user1, user2);
				const followerIndex = await twitter.getFollowerIndex(user1, user2);
				followerIndex.toString().should.equal('0');
			});

			it('emits follower added event', async () => {
				const followerAdded = await twitter.becomeFollower(user1, user2);
				const followerAddedLog = followerAdded.logs[0];
				const followerAddedEvent = followerAddedLog.args;
				followerAddedEvent.userAddress.toString().should.equal(user1.toString());
				followerAddedEvent.user.toString().should.equal('jtkanedev');
				followerAddedEvent.followerAddress.toString().should.equal(user2.toString());
				followerAddedEvent.follower.toString().should.equal('Heraclitus');
			});

			it.only('allows user to unfollow another user', async () => {
				await twitter.becomeFollower(user1, user2);
				let user1Followers = await twitter.followers(user1, 0);
				assert.include(user1Followers, user2);
				await twitter.removeFollower(user1, user2, { from: user1 });
				user1Followers = await twitter.followers(user1, 0);
				assert.notInclude(user1Followers, user2);
			});
		});

		describe('Failure', () => {});
	});
});

// const followers = twitter.followers();
// await twitter.becomeFollower(user1Address, user2Address);
// followers[user1Address].toString().should.equal(user2Address.toString());
