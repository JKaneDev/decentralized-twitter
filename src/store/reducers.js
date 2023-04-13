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
		case 'TWEETS_LOADED':
			return {
				...state,
				allTweets: { loaded: true, data: action.allTweets },
			};
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

const rootReducer = combineReducers({
	web3,
	tweetToken,
	nft,
	twitter,
	users,
});

export default rootReducer;
