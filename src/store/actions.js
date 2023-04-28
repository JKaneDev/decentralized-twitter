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

export function tweetCreated(tweet) {
	return {
		type: 'TWEET_CREATED',
		tweet,
	};
}

export function likesLoaded(allLikesData) {
	return {
		type: 'LIKES_LOADED',
		allLikesData,
	};
}

export function tweetLiked(likeData) {
	return {
		type: 'TWEET_LIKED',
		likeData,
	};
}

export function tipsLoaded(allTipData) {
	return {
		type: 'TIPS_LOADED',
		allTipData,
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

export function mintedNFTsLoaded(allMintData) {
	return {
		type: 'MINTED_NFTS_LOADED',
		allMintData,
	};
}
export function nftMinted(mintData) {
	return {
		type: 'NFT_MINTED',
		mintData,
	};
}

export function auctionDataLoaded(allAuctionData) {
	return {
		type: 'AUCTIONS_LOADED',
		allAuctionData,
	};
}

export function auctionCreated(auctionData) {
	return {
		type: 'AUCTION_CREATED',
		auctionData,
	};
}
