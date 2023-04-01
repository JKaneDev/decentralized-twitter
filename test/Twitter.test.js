const helpers = require('./helpers');
require('chai').use(require('chai-as-promised')).should();
const Twitter = artifacts.require('./Twitter');
const TweetToken = artifacts.require('./TweetToken');
const TweetNFT = artifacts.require('./TweetNFT');

contract('Twitter', ([owner, user1, user2]) => {
	let twitter;
	let tweetToken;
	let nft;

	beforeEach(async () => {
		tweetToken = await TweetToken.new();
		nft = await TweetNFT.new();
		twitter = await Twitter.new(owner, tweetToken.address, nft.address);
		await nft.setTwitterContractAddress(twitter.address);

		tweetToken.transfer(user1, helpers.tokens(100), { from: owner });
		tweetToken.transfer(user2, helpers.tokens(100), { from: owner });
	});

	describe('Deployment', async () => {
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

	describe('Creating, Removing & Editing User Accounts', async () => {
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
});
