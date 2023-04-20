import Web3 from 'web3';
import {
	web3Loaded,
	web3AccountLoaded,
	tweetTokenLoaded,
	NFTLoaded,
	twitterLoaded,
	auctionLoaded,
	allTweetsLoaded,
	profilesLoaded,
	accountCreated,
	tweetCreated,
	tweetLiked,
	userTipped,
	tipsLoaded,
	likesLoaded,
	fetchedTweetTokenBalance,
	commentCreated,
	commentsLoaded,
} from './actions';
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
	const tweetStream = await twitter.getPastEvents('TweetCreated', { fromBlock: 0, toBlock: 'latest' });
	// Format tweets
	const tweets = tweetStream.map((e) => e.returnValues);
	// Add tweets to redux store
	dispatch(allTweetsLoaded(tweets));
};

export const loadTipData = async (twitter, dispatch) => {
	const tipStream = await twitter.getPastEvents('UserTipped', {
		fromBlock: 0,
		toBlock: 'latest',
	});

	const tweetTipData = {};
	tipStream.forEach((tip) => {
		const { tweetId, tipper, amount } = tip.returnValues;
		if (!tweetTipData[tweetId]) {
			tweetTipData[tweetId] = { tipCount: 0, tips: [] };
		}
		tweetTipData[tweetId].tipCount += 1;
		tweetTipData[tweetId].tips.push({ tipper, amount });
		dispatch(tipsLoaded(tweetTipData));
	});
};

export const loadLikeData = async (twitter, dispatch) => {
	const likeStream = await twitter.getPastEvents('TweetLiked', { fromBlock: 0, toBlock: 'latest' });
	const allLikesData = [];
	likeStream.forEach((like) => {
		const likeData = {
			tweetId: like.returnValues.tweetId,
			liker: like.returnValues.liker,
		};
		allLikesData.push(likeData);
	});
	dispatch(likesLoaded(allLikesData));
};

export const createTweet = async (twitter, account, dispatch, content, profilePic) => {
	try {
		const receipt = await twitter.methods.createTweet(content, profilePic).send({ from: account });
		const event = receipt.events.TweetCreated;
		if (event) {
			const newTweet = {
				id: event.returnValues.id,
				name: event.returnValues.name,
				creator: event.returnValues.creator,
				content: event.returnValues.content,
				comments: event.returnValues.comments,
				likes: event.returnValues.likes,
				tips: event.returnValues.tips,
				imageUrl: event.returnValues.imageUrl,
				timestamp: event.returnValues.timestamp,
			};
			dispatch(tweetCreated(newTweet));
		}
	} catch (error) {
		console.error('Error creating tweet: ', error);
	}
};

export const likeTweet = async (twitter, account, dispatch, tweetId) => {
	try {
		const receipt = await twitter.methods.likeTweet(tweetId).send({ from: account });
		const event = receipt.events.TweetLiked.returnValues;
		if (event) {
			const likeData = {
				tweetId: event.tweetId,
				liker: event.liker,
			};
			dispatch(tweetLiked(likeData));
		}
	} catch (error) {
		console.error('Error liking tweet: ', error);
	}
};

export const tipUser = async (tweetToken, twitter, account, dispatch, tweetId, amount) => {
	try {
		await tweetToken.methods.approve(twitter._address, amount).send({ from: account });
		const receipt = await twitter.methods.tipUser(tweetId, amount).send({ from: account });
		const event = receipt.events.UserTipped;
		if (event) {
			const tip = {
				tweetId: event.returnValues.tweetId,
				amount: event.returnValues.amount,
				tipper: event.returnValues.tipperName,
				tipperAddress: event.returnValues.tipper,
				tipCount: event.returnValues.tipCount,
			};
			dispatch(userTipped(tip));
		}
	} catch (error) {
		console.error('Error tipping user: ', error);
	}
};

export const getTweetTokenBalance = async (tweetToken, account, dispatch) => {
	try {
		const balance = await tweetToken.methods.getBalanceOf(account).call({ from: account });
		dispatch(fetchedTweetTokenBalance(balance));
		window.alert(`Your balance is: ${balance}`);
	} catch (error) {
		console.error('Error fetching balance: ', error);
	}
};

export const loadCommentData = async (twitter, dispatch) => {
	const commentStream = await twitter.getPastEvents('CommentAdded', { fromBlock: 0, toBlock: 'latest' });
	const allCommentsData = [];
	commentStream.forEach((com) => {
		const commentData = {
			tweetId: com.returnValues.tweetId,
			commenter: com.returnValues.commenter,
			commenterName: com.returnValues.commenterName,
			comment: com.returnValues.comment,
			profilePic: com.returnValues.profilePic,
		};
		allCommentsData.push(commentData);
	});
	dispatch(commentsLoaded(allCommentsData));
};

export const createComment = async (twitter, account, dispatch, tweetId, content) => {
	try {
		const comment = await twitter.methods.createComment(tweetId, content).send({ from: account });
		const event = comment.events.CommentAdded.returnValues;

		if (event) {
			const commentData = {
				tweetId: event.tweetId,
				commenter: event.commenter,
				commenterName: event.commenterName,
				comment: event.comment,
				profilePic: event.profilePic,
			};
			dispatch(commentCreated(commentData));
		}
	} catch (error) {
		console.error('Error creating comment: ', error);
	}
};
