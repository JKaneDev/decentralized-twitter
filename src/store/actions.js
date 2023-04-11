export function web3Loaded(connection) {
	return {
		type: 'WEB3_LOADED',
		connection,
	};
}

export function web3AccountLoaded(account) {
	return {
		type: 'WEB3_ACCOUNT_LOADED',
		account,
	};
}

export function tweetTokenLoaded(contract) {
	return {
		type: 'TWEET_TOKEN_LOADED',
		contract,
	};
}

export function NFTLoaded(contract) {
	return {
		type: 'TWEET_NFT_LOADED',
		contract,
	};
}

export function twitterLoaded(contract) {
	return {
		type: 'TWITTER_LOADED',
		contract,
	};
}
export function auctionLoaded(contract) {
	return {
		type: 'AUCTION_LOADED',
		contract,
	};
}

export function allTweetsLoaded(tweets) {
	return {
		type: 'TWEETS_LOADED',
		tweets,
	};
}

export function profilesLoaded(profiles) {
	return {
		type: 'PROFILES_LOADED',
		profiles,
	};
}

// store/actions.js
export const accountCreated = (userAddress, name, bio, profilePictureURL) => {
	return {
		type: 'ACCOUNT_CREATED',
		payload: {
			userAddress,
			name,
			bio,
			profilePictureURL,
		},
	};
};
