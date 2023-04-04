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
			describe('Becoming Follower', () => {
				it('Allows user to follow another user', async () => {
					await twitter.becomeFollower(user1, user2, { from: user2 });
					const user1Followers = await twitter.followers(user1, 0);
					assert.include(user1Followers, user2);
				});

				it('updates following status to true', async () => {
					await twitter.becomeFollower(user1, user2, { from: user2 });
					const followingStatus = await twitter.isFollowing(user1, user2);
					assert.isTrue(followingStatus);
				});

				it('stores the index of the follower for a specific user', async () => {
					await twitter.becomeFollower(user1, user2, { from: user2 });
					const followerIndex = await twitter.getFollowerIndex(user1, user2);
					followerIndex.toString().should.equal('0');
				});

				it('emits follower added event', async () => {
					const followerAdded = await twitter.becomeFollower(user1, user2, { from: user2 });
					const followerAddedLog = followerAdded.logs[0];
					const followerAddedEvent = followerAddedLog.args;
					followerAddedEvent.userAddress.toString().should.equal(user1.toString());
					followerAddedEvent.user.toString().should.equal('jtkanedev');
					followerAddedEvent.followerAddress.toString().should.equal(user2.toString());
					followerAddedEvent.follower.toString().should.equal('Heraclitus');
				});
			});

			describe('Unfollow', () => {
				it('allows user to unfollow another user', async () => {
					await twitter.becomeFollower(user1, user2, { from: user2 });
					await twitter.unfollow(user1, user2, { from: user2 });
					const user1Followers = await twitter.getFollowerAddresses(user1);
					user1Followers.toString().should.equal('');
					const followingStatus = await twitter.isFollowing(user1, user2);
					assert.isFalse(followingStatus);
					const followerIndex = await twitter.getFollowerIndex(user1, user2);
					followerIndex.toString().should.equal('0');
				});

				it('emits unfollow event', async () => {
					await twitter.becomeFollower(user1, user2, { from: user2 });
					const unfollowed = await twitter.unfollow(user1, user2, { from: user2 });
					const log = unfollowed.logs[0];
					const event = log.args;
					event.user.should.equal('jtkanedev');
					event.follower.should.equal('Heraclitus');
				});
			});
		});

		describe('Failure', () => {
			beforeEach(async () => {
				await twitter.becomeFollower(user1, user2, { from: user2 });
			});

			describe('Become Follower', () => {
				it('Only user who wants to follow can call function', async () => {
					await twitter.becomeFollower(user1, user2, { from: user1 }).should.be.rejectedWith(helpers.EVM_REVERT);
				});

				it('Disallows user who does not have an account from following', async () => {
					await twitter.becomeFollower(user1, owner, { from: owner }).should.be.rejectedWith(helpers.EVM_REVERT);
				});

				it('Disallows user who is already a follower from calling follow again', async () => {
					await twitter.becomeFollower(user1, user2, { from: user2 }).should.be.rejectedWith(helpers.EVM_REVERT);
				});
			});

			describe('Unfollow', () => {
				it('Disallows user who is not the followed or follower from toggling follow status', async () => {
					await twitter.unfollow(user1, user2, { from: owner }).should.be.rejectedWith(helpers.EVM_REVERT);
				});

				it('Only follower can unfollow', async () => {
					await twitter.unfollow(user1, user2, { from: user1 }).should.be.rejectedWith(helpers.EVM_REVERT);
				});

				it('Disallows user who does not have an account from calling unfollow', async () => {
					await twitter.unfollow(user1, owner, { from: owner }).should.be.rejectedWith(helpers.EVM_REVERT);
				});

				it('function caller must already be a follower to unfollow', async () => {
					await twitter.createAccount('user3', 'miscellaneous bio', 'https://profilepic.com', { from: owner });
					const followStatus = await twitter.isFollowing(user1, user2);
					assert.isTrue(followStatus);
					await twitter.unfollow(user1, user2, { from: owner }).should.be.rejectedWith(helpers.EVM_REVERT);
				});
			});
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
				event.likeCount.toString().should.equal('0');
				event.retweetCount.toString().should.equal('0');
				expect(event.tips.length).to.equal(0);
				event.tipCount.toString().should.equal('0');
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
				tweet.likeCount.toString().should.equal('1');
			});

			it('emits a TweetLiked event', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				let like = await twitter.likeTweet(id);
				let likeLog = like.logs[0];
				let likeEvent = likeLog.args;
				likeEvent.tweetId.toString().should.equal(id.toString());
				likeEvent.likeCount.toString().should.equal('1');
			});

			it('allows user to retweet', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				await twitter.retweet(id);
				let tweet = await twitter.getTweet(id);
				tweet.retweetCount.toString().should.equal('1');
			});

			it('emits a Retweeted event', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				let retweet = await twitter.retweet(id);
				let retweetLog = retweet.logs[0];
				let retweetEvent = retweetLog.args;
				retweetEvent.tweetId.toString().should.equal(id.toString());
				retweetEvent.retweetCount.toString().should.equal('1');
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

			it('does not allow non-users to retweet', async () => {
				let result = await twitter.createTweet('Hello everyone! Good to be here :)', 'https://tweetimageurl.com', {
					from: user1,
				});
				let log = result.logs[0];
				let event = log.args;
				let id = event.id;
				await twitter.retweet(id, { from: owner }).should.be.rejectedWith(helpers.EVM_REVERT);
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
				tweet.tipCount.toString().should.equal('1');
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
				tipEvent.tipCount.toString().should.equal('1');
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
});
