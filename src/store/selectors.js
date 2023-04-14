import { create, get } from 'lodash';
import { createSelector } from 'reselect';
import moment from 'moment';

const account = (state) => get(state, 'web3.account');
export const accountSelector = createSelector(account, (a) => a);

const web3 = (state) => get(state, 'web3.connection');
export const web3Selector = createSelector(web3, (w3) => w3);

const tweetToken = (state) => get(state, 'tweetToken.tweetTokenContract');
export const tweetTokenSelector = createSelector(tweetToken, (t) => t);

const tweetTokenLoaded = (state) => get(state, 'tweetToken.loaded', false);
export const tweetTokenLoadedSelector = createSelector(tweetTokenLoaded, (tl) => tl);

const nft = (state) => get(state, 'nft.nftContract');
export const nftSelector = createSelector(nft, (nft) => nft);

const nftLoaded = (state) => get(state, 'nft.loaded', false);
export const nftLoadedSelector = createSelector(nftLoaded, (nftl) => nftl);

const twitter = (state) => get(state, 'twitter.twitterContract');
export const twitterSelector = createSelector(twitter, (tw) => tw);

const twitterLoaded = (state) => get(state, 'twitter.loaded', false);
export const twitterLoadedSelector = createSelector(twitterLoaded, (twl) => twl);

const allProfiles = (state) => get(state, 'users.allProfiles.data', []);
export const allProfilesSelector = createSelector(allProfiles, (pr) => pr);

const allProfilesLoaded = (state) => get(state, 'users.loaded', false);
export const allProfilesLoadedSelector = createSelector(allProfilesLoaded, (prl) => prl);

const allTweets = (state) => get(state, 'tweets.allTweets.data', []);
export const allTweetsSelector = createSelector(allTweets, (tweets) => {
	return tweets.map((tweet) => {
		const formattedTimestamp = moment.unix(tweet.timestamp).format('HH:mm');
		return {
			...tweet,
			timestamp: formattedTimestamp,
		};
	});
});
export const tweetSelector = createSelector(allTweets, (tweets) => {});

const allTweetsLoaded = (state) => get(state, 'tweets.allTweets.loaded', false);
export const allTweetsLoadedSelector = createSelector(allTweetsLoaded, (loaded) => loaded);
