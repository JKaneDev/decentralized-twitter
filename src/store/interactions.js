import Web3 from 'web3';
import { web3Loaded, web3AccountLoaded, tweetTokenLoaded, NFTLoaded, twitterLoaded, auctionLoaded } from './actions';
import TweetToken from '../abis/TweetToken.json';
import TweetNFT from '../abis/TweetNFT.json';
import Twitter from '../abis/Twitter.json';
import Auction from '../abis/Auction.json';

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
