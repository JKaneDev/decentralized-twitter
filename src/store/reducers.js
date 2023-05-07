import { combineReducers } from 'redux';

function web3(state = {}, action) {
	switch (action.type) {
		case 'WEB3_LOADED':
			return { ...state, loaded: true, connection: action.connection };
		case 'WEB3_ACCOUNT_LOADED':
			return { ...state, loaded: true, account: action.account };
		case 'ETHER_BALANCE_LOADED':
			return { ...state, balance: action.balance };
		default:
			return state;
	}
}

function tweetToken(state = {}, action) {
	switch (action.type) {
		case 'TWEET_TOKEN_LOADED':
			return { ...state, loaded: true, tweetTokenContract: action.contract };
		case 'TWEET_TOKEN_BALANCE_LOADED':
			return { ...state, balance: action.balance };
		case 'TWEET_TOKEN_BOUGHT':
			const { buyersNewBalance } = action.purchaseData;
			return { ...state, tweetToken: { ...state.tweetToken, balance: buyersNewBalance } };
		default:
			return state;
	}
}

function nft(state = { nfts: { loaded: false, data: { minted: [] } } }, action) {
	switch (action.type) {
		case 'TWEET_NFT_LOADED':
			return { ...state, loaded: true, nftContract: action.contract };
		case 'MINTED_NFTS_LOADED':
			return {
				...state,
				nfts: {
					...state.nfts,
					data: {
						...state.nfts.data,
						minted: action.allMintData,
					},
				},
			};
		case 'NFT_MINTED':
			return {
				...state,
				nfts: {
					...state.nfts,
					data: {
						...state.nfts.data,
						minted: [...state.nfts.data.minted, action.mintData],
					},
				},
			};

		default:
			return state;
	}
}

function auction(state = { allAuctions: { loaded: false, data: [], bids: {} } }, action) {
	switch (action.type) {
		case 'AUCTIONS_LOADED':
			return {
				...state,
				allAuctions: { loaded: true, data: action.allAuctionData },
			};
		case 'AUCTION_CREATED':
			const existingIndex = state.allAuctions.data.findIndex(
				(auction) => auction.seller === action.auctionData.seller && auction.nftId === action.auctionData.nftId,
			);

			let updatedAuctionsData;

			if (existingIndex !== -1) {
				// If a match is found, remove the existing object and insert the new one at the same index
				updatedAuctionsData = [
					...state.allAuctions.data.slice(0, existingIndex),
					action.auctionData,
					...state.allAuctions.data.slice(existingIndex + 1),
				];
			} else {
				// If no match is found, add the new object to the array
				updatedAuctionsData = [...state.allAuctions.data, action.auctionData];
			}

			return {
				...state,
				allAuctions: {
					...state.allAuctions,
					data: updatedAuctionsData,
				},
			};
		case 'AUCTION_ENDED':
			return {
				...state,
				allAuctions: {
					...state.allAuctions,
					data: state.allAuctions.data.filter((auction) => auction.nftId !== action.nftId),
				},
			};
		case 'BID_INCREASED':
			console.log('Reducer - Bid Increased: ', action);
			return {
				...state,
				allAuctions: {
					...state.allAuctions,
					bids: {
						...state.bids,
						[action.auctionAddress]: action.highestBid,
					},
				},
			};

		default:
			return state;
	}
}

function twitter(state = {}, action) {
	switch (action.type) {
		case 'TWITTER_LOADED':
			return { ...state, loaded: true, twitterContract: action.contract };
		case 'TWITTER_TOKEN_BALANCE_LOADED':
			return { ...state, tweetTokenBalance: action.balance };
		case 'TWITTER_ETHER_BALANCE_LOADED':
			return { ...state, etherBalance: action.balance };
		case 'BALANCES_LOADING':
			return { ...state, balancesLoading: true };
		case 'BALANCES_LOADED':
			return { ...state, balancesLoading: false };
		case 'TOKEN_PURCHASE_AMOUNT_CHANGED':
			return { ...state, tokenPurchase: { ...state.tokenPurchase, amount: action.amount } };
		case 'MAKING_PURCHASE':
			return { ...state, tokenPurchase: { ...state.tokenPurchase, amount: null, making: true } };
		case 'COMPLETED_PURCHASE':
			return { ...state, tokenPurchase: { ...state.tokenPurchase, making: false } };

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
			const { allLikesData } = action;

			const updatedTweetsWithLikes = state.allTweets.data.map((tweet) => {
				// Filter the likes for the current tweet, add them to the tweet object
				const likesForTweet = allLikesData.filter((like) => like.tweetId === tweet.id);
				// If there are likes for the tweet, add them to the tweet object
				if (likesForTweet.length > 0) {
					return {
						...tweet,
						likes: [...likesForTweet],
					};
				}
				return tweet;
			});

			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedTweetsWithLikes,
				},
			};
		case 'TWEET_LIKED':
			const { likeData } = action;
			const updatedLikes = state.allTweets.data.map((tweet) => {
				if (tweet.id === likeData.tweetId) {
					return {
						...tweet,
						likes: [...tweet.likes, likeData],
					};
				}
				return tweet;
			});

			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedLikes,
				},
			};
		case 'TIPS_LOADED':
			const { allTipData } = action;

			const updatedTweetsWithTips = state.allTweets.data.map((tweet) => {
				// Filter the comments that belong to the current tweet
				const tipsForTweet = allTipData.filter((tip) => tip.tweetId === tweet.id);

				// If there are comments for the current tweet, add them to the tweet object
				if (tipsForTweet.length > 0) {
					return {
						...tweet,
						tips: [...tipsForTweet],
					};
				}

				// If there are no comments for the current tweet, return the original tweet object
				return tweet;
			});
			return {
				...state,
				allTweets: {
					...state.allTweets,
					data: updatedTweetsWithTips,
				},
			};
		case 'USER_TIPPED':
			const { tip } = action;
			console.log('Tip Action: ', tip);
			const updatedTips = state.allTweets.data.map((tweet) => {
				if (tweet.id === tip.tweetId) {
					return { ...tweet, tips: [...tweet.tips, tip] };
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
	auction,
	twitter,
	users,
	tweets,
});

export default rootReducer;
