import Web3 from 'web3';
import { web3Loaded, web3AccountLoaded, tweetTokenLoaded, NFTLoaded, twitterLoaded, auctionLoaded } from './actions';
import TweetToken from '../abis/TweetToken.json';
import TweetNFT from '../abis/TweetNFT.json';
import Twitter from '../abis/Twitter.json';
import Auction from '../abis/Auction.json';
import { allTweetsLoaded, profilesLoaded, accountCreated, tweetCreated } from './actions';
import { Log } from 'ethers';

export const loadWeb3 = async (dispatch) => {
	if (typeof window.ethereum !== 'undefined') {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		const web3 = new Web3(window.ethereum);
		dispatch(web3Loaded(web3));
		return web3;
	} else {
		window.alert('Please install MetaMask');
		window.location.assign('https://metamask.io/');
	}
};
export const loadAccount = async (web3, dispatch) => {
	await window.ethereum.request({ method: 'eth_requestAccounts' });
	const accounts = await web3.eth.getAccounts();
	const account = accounts[0];
	dispatch(web3AccountLoaded(account));
	return account;
};

export const loadTweetToken = async (web3, networkId, dispatch) => {
	try {
		const token = new web3.eth.Contract(TweetToken.abi, TweetToken.networks[networkId].address);
		dispatch(tweetTokenLoaded(token));
		return token;
	} catch (error) {
		console.log('Tweet Token not deployed to the current network. Please select another network with Metamask.');
		return null;
	}
};

export const loadTweetNFT = async (web3, networkId, dispatch) => {
	try {
		const nft = new web3.eth.Contract(TweetNFT.abi, TweetNFT.networks[networkId].address);
		dispatch(NFTLoaded(nft));
		return nft;
	} catch (error) {
		console.log('Tweet NFT not deployed to the current network. Please select another network with Metamask.');
		return null;
	}
};

export const loadTwitter = async (web3, networkId, dispatch) => {
	try {
		const twitter = new web3.eth.Contract(Twitter.abi, Twitter.networks[networkId].address);
		dispatch(twitterLoaded(twitter));
		return twitter;
	} catch (error) {
		console.log('Twitter Contract not deployed to the current network. Please select another network with Metamask.');
		return null;
	}
};

export const loadAuction = async (web3, networkId, dispatch) => {
	try {
		const auction = new web3.eth.Contract(Auction.abi, Auction.networks[networkId].address);
		dispatch(auctionLoaded(auction));
		return auction;
	} catch (error) {
		console.log('Auction Contract not deployed to the current network. Please select another network with Metamask.');
		return null;
	}
};

export const createAccount = async (twitterContract, name, bio, profilePictureUrl, account, dispatch) => {
	try {
		await twitterContract.methods.createAccount(name, bio, profilePictureUrl).send({ from: account });
		// dispatch an action to update redux store
		dispatch(accountCreated(account, name, bio, profilePictureUrl));
	} catch (error) {
		console.error('Error creating account: ', error);
	}
};

export const loadProfiles = async (twitter, dispatch) => {
	// Fetch all accounts from the 'AccountCreated' stream
	const profileStream = await twitter.getPastEvents('AccountCreated', {
		fromBlock: 0,
		toBlock: 'latest',
	});

	// Format profiles
	const profiles = profileStream.map((e) => e.returnValues);

	// Add profiles to redux store
	dispatch(profilesLoaded(profiles));
};

export const loadAllTweets = async (twitter, dispatch) => {
	// Fetch all tweets with the 'TweetCreated' stream
	const tweetStream = await twitter.getPastEvents('TweetCreated', {
		fromBlock: 0,
		toBlock: 'latest',
	});
	// Format tweets
	const tweets = tweetStream.map((e) => e.returnValues);
	// Add tweets to redux store
	dispatch(allTweetsLoaded(tweets));
};
export const createTweet = async (twitter, account, dispatch, content, profilePic) => {
	try {
		await twitter.methods.createTweet(content, profilePic).send({ from: account });
		dispatch(tweetCreated(content));
	} catch (error) {
		console.error('Error creating tweet: ', error);
	}
};
