import Web3 from 'web3';
import {
	web3Loaded,
	web3AccountLoaded,
	tweetTokenLoaded,
	NFTLoaded,
	twitterLoaded,
	allTweetsLoaded,
	profilesLoaded,
	accountCreated,
	tweetCreated,
	tweetLiked,
	userTipped,
	tipsLoaded,
	likesLoaded,
	etherBalanceLoaded,
	tweetTokenBalanceLoaded,
	twitterEtherBalanceLoaded,
	twitterTokenBalanceLoaded,
	commentCreated,
	commentsLoaded,
	nftMinted,
	mintedNFTsLoaded,
	auctionCreated,
	auctionDataLoaded,
	highestBidIncreased,
	auctionEnded,
	tweetTokenBought,
	balancesLoading,
	balancesLoaded,
	completedPurchase,
} from './actions';
import TweetToken from '../abis/TweetToken.json';
import TweetNFT from '../abis/TweetNFT.json';
import Twitter from '../abis/Twitter.json';
import Auction from '../abis/Auction.json';
import { ETHER_ADDRESS } from './helpers';

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
		console.log('Tweet Token Contract Loaded');
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
		console.log('Tweet NFT Contract Loaded');
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
		console.log('Twitter Contract Loaded');
		return twitter;
	} catch (error) {
		console.log('Twitter Contract not deployed to the current network. Please select another network with Metamask.');
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

export const loadProfiles = async (web3, twitter, dispatch) => {
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const blocksInPast = 10000000;
	const fromBlock = Math.max(0, currentBlockNumber - blocksInPast);
	// Fetch all accounts from the 'AccountCreated' stream
	const profileStream = await twitter.getPastEvents('AccountCreated', {
		fromBlock: fromBlock,
		toBlock: 'latest',
	});

	// Format profiles
	const profiles = profileStream.map((e) => e.returnValues);
	console.log('Profiles:', profiles);

	// Add profiles to redux store
	dispatch(profilesLoaded(profiles));
};

export const loadAllTweets = async (web3, twitter, dispatch) => {
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const blocksInPast = 10000000;
	const fromBlock = Math.max(0, currentBlockNumber - blocksInPast);
	// Fetch all tweets with the 'TweetCreated' stream
	const tweetStream = await twitter.getPastEvents('TweetCreated', { fromBlock: fromBlock, toBlock: 'latest' });
	// Format tweets
	const tweets = tweetStream.map((e) => e.returnValues);
	console.log('Tweet:', tweets);
	// Add tweets to redux store
	dispatch(allTweetsLoaded(tweets));
};

export const createTweet = async (twitter, account, dispatch, content, profilePic) => {
	try {
		const receipt = await twitter.methods.createTweet(content, profilePic).send({ from: account });
		const event = receipt.events.TweetCreated;
		console.log('Tweet Created:', event.returnValues);
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

export const loadLikeData = async (web3, twitter, dispatch) => {
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const blocksInPast = 10000000;
	const fromBlock = Math.max(0, currentBlockNumber - blocksInPast);
	const likeStream = await twitter.getPastEvents('TweetLiked', { fromBlock: fromBlock, toBlock: 'latest' });
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
		console.log('Tweet Liked:', event);
		const likeData = {
			tweetId: event.tweetId,
			liker: event.liker,
		};
		dispatch(tweetLiked(likeData));
	} catch (error) {
		console.error('Error liking tweet: ', error);
	}
};

export const loadBalances = async (dispatch, web3, tweetToken, twitter, account) => {
	if (typeof account !== 'undefined') {
		// Ether balance in wallet
		const etherBalance = await web3.eth.getBalance(account);
		dispatch(etherBalanceLoaded(etherBalance));

		// Token balance in wallet
		const tokenBalance = await tweetToken.methods.balanceOf(account).call();
		dispatch(tweetTokenBalanceLoaded(tokenBalance));

		// Ether balance on exchange
		const twitterEtherBalance = await twitter.methods.balanceOf(ETHER_ADDRESS, account).call();
		dispatch(twitterEtherBalanceLoaded(twitterEtherBalance));

		// Token balance in wallet
		const twitterTokenBalance = await twitter.methods.balanceOf(tweetToken.options.address, account).call();
		dispatch(twitterTokenBalanceLoaded(twitterTokenBalance));

		// Trigger all balances loaded
		dispatch(balancesLoaded());
	} else {
		window.alert('Please login with MetaMask');
	}
};

export const buyTweetToken = (web3, dispatch, twitter, amount, account) => {
	let tokensInWei = web3.utils.toWei(amount, 'ether');
	let etherValue = web3.utils.toWei((parseFloat(amount) / 1000).toString(), 'ether');
	twitter.methods
		.buyTweetTokens(tokensInWei)
		.send({ from: account, value: etherValue })
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading());
		})
		.on('receipt', (receipt) => {
			dispatch(completedPurchase());
		})
		.on('error', (error) => {
			console.error('Error buying tokens!', error);
			window.alert('There was an error buying tokens');
		});
};

export const subscribeToTwitterEvents = async (twitter, dispatch) => {
	twitter.events.TweetTokenBought({}, (error, event) => {
		dispatch(tweetTokenBought(event.returnValues));
		console.log('Tweet Token Bought:', event);
	});
};

export const loadTipData = async (web3, twitter, dispatch) => {
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const blocksInPast = 10000000;
	const fromBlock = Math.max(0, currentBlockNumber - blocksInPast);
	const tipStream = await twitter.getPastEvents('UserTipped', { fromBlock: fromBlock, toBlock: 'latest' });
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
	const amountInWei = Web3.utils.toWei(amount, 'ether');
	try {
		await tweetToken.methods.approve(twitter._address, amount).send({ from: account });
		const receipt = await twitter.methods.tipUser(tweetId, amountInWei).send({ from: account });
		const event = receipt.events.UserTipped.returnValues;
		console.log('Tip Event: ', event);
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

export const loadCommentData = async (web3, twitter, dispatch) => {
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const blocksInPast = 10000000;
	const fromBlock = Math.max(0, currentBlockNumber - blocksInPast);
	const commentStream = await twitter.getPastEvents('CommentAdded', { fromBlock: fromBlock, toBlock: 'latest' });
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
		console.log('Comment Created:', event);
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

export const loadMintedNFTs = async (web3, nftContract, dispatch) => {
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const blocksInPast = 10000000;
	const fromBlock = Math.max(0, currentBlockNumber - blocksInPast);
	const mintStream = await nftContract.getPastEvents('NFTMinted', { fromBlock: fromBlock, toBlock: 'latest' });
	const allMintData = [];
	mintStream.forEach(async (mint) => {
		const nftId = mint.returnValues.nftId;
		const currentOwner = await nftContract.methods.ownerOf(nftId).call();

		const mintData = {
			id: nftId,
			owner: currentOwner,
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
		console.log('NFT Minted:', event);
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

export const loadAllAuctions = async (nftContract, dispatch, web3) => {
	const currentBlockNumber = await web3.eth.getBlockNumber();
	const blocksInPast = 10000000;
	const fromBlock = Math.max(0, currentBlockNumber - blocksInPast);
	const auctionStream = await nftContract.getPastEvents('AuctionCreated', { fromBlock: fromBlock, toBlock: 'latest' });
	const allAuctionData = [];

	(async () => {
		const endedPromises = auctionStream.map(async (auction) => {
			const auctionData = {
				originalOwner: auction.returnValues.originalOwner,
				seller: auction.returnValues.seller,
				nftId: auction.returnValues.nftId,
				startingPrice: auction.returnValues.startingPrice,
				duration: auction.returnValues.auctionDuration,
				endTime: auction.returnValues.auctionEndTime,
				auctionAddress: auction.returnValues.auctionAddress,
			};

			// Check if ended
			const isEnded = await isAuctionEnded(web3, auctionData);

			// Only add to redux if not ended
			if (!isEnded) {
				allAuctionData.push(auctionData);
			}
		});

		// Wait for all ended checks to complete
		await Promise.all(endedPromises);

		dispatch(auctionDataLoaded(allAuctionData));
	})();
};

export const startAuction = async (nftContract, account, dispatch, nftId, startingPrice, auctionDuration) => {
	try {
		const auction = await nftContract.methods
			.createAuction(nftId, startingPrice, auctionDuration)
			.send({ from: account });
		const event = auction.events.AuctionCreated.returnValues;
		console.log('Auction Started:', event);
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
		console.log('Bid Placed:', event);
	});
};

export const placeBid = async (auction, account, amount) => {
	try {
		await auction.methods.bid().send({ from: account, value: amount });
	} catch (error) {
		console.error('Error placing bid: ', error);
	}
};

export const isAuctionEnded = async (web3, auction) => {
	const auctionInstance = new web3.eth.Contract(Auction.abi, auction.auctionAddress);
	const ended = await auctionInstance.methods.getEnded().call();
	return ended;
};

export const endAuction = async (auctionContract, account, nftId, dispatch) => {
	try {
		await auctionContract.methods.endAuction().send({ from: account });
		dispatch(auctionEnded(nftId));
	} catch (error) {
		console.error('Error ending auction: ', error);
	}
};
