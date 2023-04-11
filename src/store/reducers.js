import { combineReducers } from 'redux';

function web3(state = {}, action) {
	switch (action.type) {
		case 'WEB3_LOADED':
			return { ...state, connection: action.connection };
		case 'WEB3_ACCOUNT_LOADED':
			return { ...state, account: action.account };
		default:
			return state;
	}
}

function twitter(state = {}, action) {
	switch (action.type) {
		case 'TWEET_TOKEN_LOADED':
			return { ...state, tweetTokenContract: action.contract };
		case 'TWEET_NFT_LOADED':
			return { ...state, nftContract: action.contract };
		case 'TWITTER_LOADED':
			return { ...state, twitterContract: action.contract };
		case 'TWEETS_LOADED':
			return {
				...state,
				allTweets: { loaded: true, data: action.allTweets },
			};
		default:
			return state;
	}
}

function users(state = {}, action) {
	switch (action.type) {
		case 'PROFILES_LOADED':
			return {
				...state,
				allProfiles: { loaded: true, data: action.allProfiles },
			};
		case 'ACCOUNT_CREATED':
			return {
				...state,
				userAddress: action.payload.userAddress,
				name: action.payload.name,
				bio: action.payload.bio,
				profilePictureUrl: action.payload.profilePictureUrl,
			};
		default:
			return state;
	}
}

const rootReducer = combineReducers({
	web3,
	twitter,
	users,
});

export default rootReducer;
