import { get } from 'lodash';
import { createSelector } from 'reselect';
import moment from 'moment';
import { formatBalance } from './helpers';

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
		const formattedComments = tweet.comments.map((comment) => {
			const formattedCommentTimestamp = moment.unix(comment.timestamp).format('HH:mm');
			return {
				...comment,
				timestamp: formattedCommentTimestamp,
			};
		});
		return {
			...tweet,
			timestamp: formattedTimestamp,
			comments: formattedComments,
		};
	});
});

const allTweetsLoaded = (state) => get(state, 'tweets.allTweets.loaded', false);
export const allTweetsLoadedSelector = createSelector(allTweetsLoaded, (loaded) => loaded);

const mintedNFTs = (state) => get(state, 'nft.nfts.data.minted', []);
export const mintedNFTsSelector = createSelector(mintedNFTs, (nfts) => nfts);

const allAuctionsLoaded = (state) => get(state, 'auction.allAuctions.loaded', false);
export const allAuctionsLoadedSelector = createSelector(allAuctionsLoaded, (l) => l);

const allAuctions = (state) => get(state, 'auction.allAuctions.data', []);
export const allAuctionsSelector = createSelector(allAuctions, (auctions) => auctions);

const bids = (state) => get(state, 'auction.allAuctions.bids', {});
export const bidsSelector = createSelector(bids, (bids) => bids);

const balancesLoading = (state) => get(state, 'twitter.balancesLoading', false);
export const balancesLoadingSelector = createSelector(balancesLoading, (loading) => loading);

const maticBalance = (state) => get(state, 'web3.balance', 0);
export const maticBalanceSelector = createSelector(maticBalance, (balance) => formatBalance(balance));

const tweetTokenBalance = (state) => get(state, 'tweetToken.balance', 0);
export const tweetTokenBalanceSelector = createSelector(tweetTokenBalance, (balance) => formatBalance(balance));

const twitterMaticBalance = (state) => get(state, 'twitter.maticBalance', 0);
export const twitterMaticBalanceSelector = createSelector(twitterMaticBalance, (balance) => formatBalance(balance));

const twitterTokenBalance = (state) => get(state, 'twitter.tweetTokenBalance', 0);
export const twitterTokenBalanceSelector = createSelector(twitterTokenBalance, (balance) => formatBalance(balance));

const maticDepositAmount = (state) => get(state, 'twitter.maticDepositAmount', 0);
export const maticDepositAmountSelector = createSelector(maticDepositAmount, (amount) => amount);

const tokenDepositAmount = (state) => get(state, 'twitter.tokenDepositAmount', 0);
export const tokenDepositAmountSelector = createSelector(tokenDepositAmount, (amount) => amount);

const maticWithdrawAmount = (state) => get(state, 'twitter.maticWithdrawAmount', 0);
export const maticWithdrawAmountSelector = createSelector(maticWithdrawAmount, (amount) => amount);

const tokenWithdrawAmount = (state) => get(state, 'twitter.tokenWithdrawAmount', 0);
export const tokenWithdrawAmountSelector = createSelector(tokenWithdrawAmount, (amount) => amount);

const tokenPurchase = (state) => get(state, 'twitter.tokenPurchase', {});
export const tokenPurchaseSelector = createSelector(tokenPurchase, (purchase) => purchase);
