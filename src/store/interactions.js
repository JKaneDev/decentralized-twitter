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
	nftMinted,
	mintedNFTsLoaded,
	auctionCreated,
	auctionDataLoaded,
	highestBidIncreased,
	highestBidLoaded,
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

export const likeTweet = async (twitter, account, dispatch, tweetId) => {
	try {
		const receipt = await twitter.methods.likeTweet(tweetId).send({ from: account });
		const event = receipt.events.TweetLiked.returnValues;
		const likeData = {
			tweetId: event.tweetId,
			liker: event.liker,
		};
		dispatch(tweetLiked(likeData));
	} catch (error) {
		console.error('Error liking tweet: ', error);
	}
};

export const loadTipData = async (twitter, dispatch) => {
	const tipStream = await twitter.getPastEvents('UserTipped', { fromBlock: 0, toBlock: 'latest' });
	const allTipData = [];

	tipStream.forEach((tip) => {
		const tipData = {
			tipper: tip.returnValues.tipper,
			tipperName: tip.returnValues.tipperName,
			tweetId: tip.returnValues.tweetId,
			creator: tip.returnValues.creator,
			amount: tip.returnValues.amount,
		};
		allTipData.push(tipData);
	});
	dispatch(tipsLoaded(allTipData));
};

export const tipUser = async (tweetToken, twitter, account, dispatch, tweetId, amount) => {
	try {
		await tweetToken.methods.approve(twitter._address, amount).send({ from: account });
		const receipt = await twitter.methods.tipUser(tweetId, amount).send({ from: account });
		const event = receipt.events.UserTipped.returnValues;
		const tip = {
			tipper: event.tipper,
			tipperName: event.tipperName,
			tweetId: event.tweetId,
			creator: event.creator,
			amount: event.amount,
		};
		dispatch(userTipped(tip));
	} catch (error) {
		console.error('Error tipping user: ', error);
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
			timestamp: com.returnValues.timestamp,
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
				timestamp: event.timestamp,
			};
			dispatch(commentCreated(commentData));
		}
	} catch (error) {
		console.error('Error creating comment: ', error);
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

export const loadMintedNFTs = async (nftContract, dispatch) => {
	const mintStream = await nftContract.getPastEvents('NFTMinted', { fromBlock: 0, toBlock: 'latest' });
	const allMintData = [];
	mintStream.forEach((mint) => {
		const mintData = {
			id: mint.returnValues.nftId,
			owner: mint.returnValues.owner,
			tweetId: mint.returnValues.tweetId,
			metadataURI: mint.returnValues.fullUri,
			imageURI: mint.returnValues.imageURI,
			htmlURI: mint.returnValues.htmlURI,
			timestamp: mint.returnValues.timestamp,
		};
		allMintData.push(mintData);
	});

	dispatch(mintedNFTsLoaded(allMintData));
};

export const mintNFT = async (nftContract, account, tweetId, metadataURI, imageURI, htmlURI, dispatch) => {
	try {
		const mint = await nftContract.methods
			.mintTweetNFT(account, tweetId, metadataURI, imageURI, htmlURI)
			.send({ from: account });
		const event = mint.events.NFTMinted.returnValues;
		if (event) {
			const mintData = {
				id: event.nftId,
				owner: event.owner,
				tweetId: event.tweetId,
				metadataURI: event.fullUri,
				imageURI: event.imageURI,
				htmlURI: event.htmlURI,
				timestamp: event.timestamp,
			};
			dispatch(nftMinted(mintData));
		}
	} catch (error) {
		console.error('Error minting NFT: ', error);
	}
};

export const loadAllAuctions = async (nftContract, dispatch) => {
	const auctionStream = await nftContract.getPastEvents('AuctionCreated', { fromBlock: 0, toBlock: 'latest' });
	const allAuctionData = [];
	auctionStream.forEach((auction) => {
		const auctionData = {
			originalOwner: auction.returnValues.originalOwner,
			seller: auction.returnValues.seller,
			nftId: auction.returnValues.nftId,
			startingPrice: auction.returnValues.startingPrice,
			duration: auction.returnValues.auctionDuration,
			endTime: auction.returnValues.auctionEndTime,
			auctionAddress: auction.returnValues.auctionAddress,
		};
		allAuctionData.push(auctionData);
	});
	dispatch(auctionDataLoaded(allAuctionData));
};

export const startAuction = async (nftContract, account, dispatch, nftId, startingPrice, auctionDuration) => {
	try {
		const auction = await nftContract.methods
			.createAuction(nftId, startingPrice, auctionDuration)
			.send({ from: account });
		const event = auction.events.AuctionCreated.returnValues;
		if (event) {
			const auctionData = {
				originalOwner: event.originalOwner,
				seller: event.seller,
				nftId: event.nftId,
				startingPrice: event.startingPrice,
				duration: event.auctionDuration,
				endTime: event.auctionEndTime,
				auctionAddress: event.auctionAddress,
			};
			dispatch(auctionCreated(auctionData));
			return event.auctionAddress;
		}
	} catch (error) {
		console.error('Error starting auction: ', error);
	}
};

export const loadHighestBid = async (auction) => {
	try {
		const highestBid = await auction.methods.getHighestBid().call();
		return highestBid;
	} catch (error) {
		console.error('Error fetching highest bid:', error);
		return null;
	}
};

export const getActiveAuction = async (web3, nftContract, nftId) => {
	const auctionAddresses = await nftContract.methods.getAuctionAddresses(nftId).call();
	for (const auctionAddress of auctionAddresses) {
		const auctionInstance = new web3.eth.Contract(Auction.abi, auctionAddress);
		const active = await auctionInstance.methods.isActive().call();
		if (active) {
			return auctionInstance;
		}
	}
	return null;
};

export const subscribeToAuctionEvents = async (auction, dispatch) => {
	auction.events.HighestBidIncreased({}, async (error, event) => {
		const highestBid = await auction.methods.getHighestBid().call();
		dispatch(highestBidIncreased(auction, highestBid));
		console.log('New Highest Bid:', highestBid);
	});
};

export const isAuctionEnded = async (web3, auction) => {
	const auctionInstance = new web3.eth.Contract(Auction.abi, auction.auctionAddress);
	const ended = await auctionInstance.methods.getEnded().call();
	return ended;
};

export const endAuction = async (auctionContract, account) => {
	try {
		const auction = await auctionContract.methods.endAuction().send({ from: account });
		console.log('Auction Event:', auction);
	} catch (error) {
		console.error('Error ending auction: ', error);
	}
};
