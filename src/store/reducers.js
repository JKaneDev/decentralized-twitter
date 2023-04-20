import { combineReducers } from 'redux';

function web3(state = {}, action) {
	switch (action.type) {
		case 'WEB3_LOADED':
			return { ...state, loaded: true, connection: action.connection };
		case 'WEB3_ACCOUNT_LOADED':
			return { ...state, loaded: true, account: action.account };
		default:
			return state;
	}
}

function tweetToken(state = {}, action) {
	switch (action.type) {
		case 'TWEET_TOKEN_LOADED':
			return { ...state, loaded: true, tweetTokenContract: action.contract };
		case 'TWEET_BALANCE_FETCHED':
			return {
				...state,
				balance: action.balance,
			};
		default:
			return state;
	}
}

function nft(state = {}, action) {
	switch (action.type) {
		case 'TWEET_NFT_LOADED':
			return { ...state, loaded: true, nftContract: action.contract };
		default:
			return state;
	}
}

function twitter(state = {}, action) {
	switch (action.type) {
		case 'TWITTER_LOADED':
			return { ...state, loaded: true, twitterContract: action.contract };

		default:
			return state;
	}
}

function users(state = { allProfiles: { loaded: false, data: [] } }, action) {
	switch (action.type) {
		case 'PROFILES_LOADED':
			return {
				...state,
				allProfiles: { loaded: true, data: action.allProfiles },
			};
		case 'ACCOUNT_CREATED':
			return {
				...state,
				allProfiles: {
					...state.allProfiles,
					data: [...state.allProfiles.data, action.payload],
				},
			};
		default:
			return state;
	}
}

function tweets(state = { allTweets: { loaded: false, data: [] } }, action) {
	switch (action.type) {
		case 'TWEETS_LOADED':
			return {
				...state,
				allTweets: { loaded: true, data: action.tweets },
			};
		case 'TWEET_CREATED':
			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: [...state.allTweets.data, action.tweet],
				},
			};
		case 'COMMENTS_LOADED':
			const { allCommentsData } = action;
			const updatedTweetsWithComments = state.allTweets.data.map((tweet) => {
				// Filter the comments that belong to the current tweet
				const commentsForTweet = allCommentsData.filter((comment) => comment.tweetId === tweet.id);

				// If there are comments for the current tweet, add them to the tweet object
				if (commentsForTweet.length > 0) {
					return {
						...tweet,
						comments: [...commentsForTweet],
					};
				}

				// If there are no comments for the current tweet, return the original tweet object
				return tweet;
			});

			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedTweetsWithComments,
				},
			};
		case 'COMMENT_ADDED':
			const { commentData } = action;
			// update redux store with new comment
			const updatedComments = state.allTweets.data.map((tweet) => {
				if (tweet.id === commentData.tweetId) {
					return {
						...tweet,
						comments: [...tweet.comments, commentData],
					};
				}
				return tweet;
			});

			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedComments,
				},
			};

		case 'LIKES_LOADED':
			const { likeData } = action;
			const updatedLikesFromEventStream = state.allTweets.data.map((tweet) => {
				if (likeData[tweet.id]) {
					return {
						...tweet,
						likeCount: likeData[tweet.id].likeCount,
					};
				}
				return tweet;
			});
			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedLikesFromEventStream,
				},
			};
		case 'TWEET_LIKED':
			const updatedLikeCount = state.allTweets.data.map((tweet) => {
				if (tweet.id === action.newLikeCount.tweetId) {
					return {
						...tweet,
						likeCount: action.newLikeCount.updatedLikeCount,
					};
				} else {
					return tweet;
				}
			});
			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedLikeCount,
				},
			};
		case 'TIPS_LOADED':
			const { tipData } = action;
			const updatedTipsFromEventStream = state.allTweets.data.map((tweet) => {
				if (tipData[tweet.id]) {
					return {
						...tweet,
						tipCount: tipData[tweet.id].tipCount,
						tips: tipData[tweet.id].tips,
					};
				}
				return tweet;
			});
			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedTipsFromEventStream,
				},
			};
		case 'USER_TIPPED':
			const { tweetId, tipCount, tipper, tipperAddress, amount } = action.tip;
			const updatedTips = state.allTweets.data.map((tweet) => {
				if (tweet.id === tweetId) {
					return {
						...tweet,
						tipCount: tipCount,
						tips: [
							...tweet.tips,
							{
								tipperAddress: tipperAddress,
								tipper: tipper,
								amount: amount,
							},
						],
					};
				}
				return tweet;
			});
			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedTips,
				},
			};
		default:
			return state;
	}
}

const rootReducer = combineReducers({
	web3,
	tweetToken,
	nft,
	twitter,
	users,
	tweets,
});

export default rootReducer;
