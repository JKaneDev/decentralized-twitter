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

export function profilesLoaded(allProfiles) {
	return {
		type: 'PROFILES_LOADED',
		allProfiles,
	};
}

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

export function allTweetsLoaded(tweets) {
	return {
		type: 'TWEETS_LOADED',
		tweets,
	};
}

export function tipsLoaded(tipData) {
	return {
		type: 'TIPS_LOADED',
		tipData,
	};
}

export function likesLoaded(likeData) {
	return {
		type: 'LIKES_LOADED',
		likeData,
	};
}

export function tweetCreated(tweet) {
	return {
		type: 'TWEET_CREATED',
		tweet,
	};
}

export function tweetLiked(newLikeCount) {
	return {
		type: 'TWEET_LIKED',
		newLikeCount,
	};
}

export function userTipped(tip) {
	return {
		type: 'USER_TIPPED',
		tip,
	};
}

export function fetchedTweetTokenBalance(balance) {
	return {
		type: 'TOKEN_BALANCE_FETCHED',
		balance,
	};
}

export function commentsLoaded(allCommentsData) {
	return {
		type: 'COMMENTS_LOADED',
		allCommentsData,
	};
}

export function commentCreated(commentData) {
	return {
		type: 'COMMENT_ADDED',
		commentData,
	};
}
