import AuctionABI from '../abis/Auction.json';
import styles from '@components/styles/Auction.module.css';
import NFTCard from '@components/components/NFTCard';
import UsersActiveAuctionsCard from '@components/components/UsersActiveAuctionCard.';
import { useEffect, useState, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import 'react-tabs/style/react-tabs.css';
import {
	startAuction,
	endAuction,
	loadMintedNFTs,
	loadAllAuctions,
	subscribeToAuctionEvents,
	getActiveAuction,
	loadTweetNFT,
} from '@components/store/interactions';
import {
	accountSelector,
	allAuctionsSelector,
	mintedNFTsSelector,
	nftSelector,
	allAuctionsLoadedSelector,
	web3Selector,
	nftLoadedSelector,
} from '@components/store/selectors';

const Auction = ({ web3, nftContractLoaded, nftContract, nfts, account, auctions, auctionsLoaded }) => {
	// BRING USER BACK TO FEED
	const backToFeed = () => {
		router.push(`/`);
	};

	const dispatch = useDispatch();
	const router = useRouter();

	const [loading, setLoading] = useState(false);
	const [toggleAuctionActivation, setToggleAuctionActivation] = useState(false);
	const [toggleAuctionEnded, setToggleAuctionEnded] = useState(false);
	const [auctionInstances, setAuctionInstances] = useState([]);

	// ON FIRST RENDER
	useEffect(() => {
		if (nftContractLoaded) {
			loadBlockchainData(nftContract, dispatch);
		}
	}, []);

	// RENDER NFTS AFTER LOADED
	useEffect(() => {
		if (nfts.length > 0 && auctionsLoaded) {
			renderUsersNFTs(nfts, auctions);
			renderUsersActiveAuctions(nfts, auctions);
		}
	}, [nfts, account, auctionsLoaded]);

	// INITIALIZE AUCTION INSTANCES
	useEffect(() => {
		loadAuctionInstances(auctions, web3, nftContract);
	}, [auctions, auctionsLoaded]);

	// ENSURES TIMER RENDERS IMMEDIATELY AFTER AUCTION START
	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
	}, [toggleAuctionActivation]);

	// RERENDER COMPONENT WHEN AUCTION ENDS
	useEffect(() => {
		renderUsersActiveAuctions(nfts, auctions);
	}, [toggleAuctionEnded]);

	// LOADS MINTED NFTS AND ALL AUCTIONS
	const loadBlockchainData = async (nftContract, dispatch) => {
		await loadMintedNFTs(nftContract, dispatch);
		await loadAllAuctions(nftContract, dispatch);
	};

	// CREATE NEW AUCTION INSTANCE FOR EACH AUCTION
	const createAuctionInstance = (abi, address) => new web3.eth.Contract(abi, address);

	// INITIALIZE WEB3 INSTANCES FOR ALL AUCTIONS
	const loadAuctionInstances = async (auctions, web3, nftContract) => {
		const activeAuctions = await Promise.all(
			auctions.map(async (auction) => {
				const activeAuction = await getActiveAuction(web3, nftContract, auction.nftId);

				return activeAuction;
			}),
		);
		setAuctionInstances(activeAuctions.filter((auction) => auction !== null));
	};

	// STARTS THE AUCTION, TRIGGERS TIMER RE-RENDERING WITH TOGGLE
	const handleAuctionStart = async (nftContract, dispatch, nftId, startingPrice, auctionDuration) => {
		setLoading(true);
		const auctionAddress = await startAuction(nftContract, account, dispatch, nftId, startingPrice, auctionDuration);
		const auction = createAuctionInstance(AuctionABI.abi, auctionAddress);
		subscribeToAuctionEvents(auction, dispatch);
		setToggleAuctionActivation(!toggleAuctionActivation);
		setLoading(false);
		console.log('AUCTION INSTANCE', auction);
		console.log('AUCTION STARTED', auctions);
	};

	// FETCH NFTS THAT BELONG TO USER, RENDER TO DOM
	const renderUsersNFTs = (nfts, auctions) => {
		const usersNfts = nfts.filter((nft) => nft.owner == account);
		const cards = [];

		for (const nft of usersNfts) {
			const auction = auctions.find((auction) => auction.nftId === nft.id);

			cards.push(
				<NFTCard
					key={nft.id}
					contract={nftContract}
					dispatch={dispatch}
					nfts={nfts}
					nft={nft}
					auction={auction}
					loading={loading}
					handleAuctionStart={handleAuctionStart}
				/>,
			);
		}
		return cards;
	};

	const renderUsersActiveAuctions = (nfts, auctions) => {
		const usersNfts = nfts.filter((nft) => nft.owner === account);
		const cards = [];

		for (const nft of usersNfts) {
			// AUCTIONS THAT BELONG TO THE USER
			const auction = auctions.find((auction) => auction.nftId === nft.id);

			// SMART CONTRACT INSTANCE
			const auctionInstance = auctionInstances.find((instance) => instance._address === auction.auctionAddress);

			{
				auctionInstance
					? cards.push(
							<UsersActiveAuctionsCard key={nft.id} ntf={nft} auction={auction} auctionInstance={auctionInstance} />,
					  )
					: null;
			}
		}
		return cards;
	};

	return (
		<div className={styles.container}>
			<div className={styles.back}>
				<button className={styles.backBtn} onClick={backToFeed}>
					<FontAwesomeIcon icon={faArrowLeft} size='sm' />
					Back
				</button>
			</div>
			<Tabs className={styles.reactTabs}>
				<TabList className={styles.reactTabsTabList}>
					<Tab className={styles.reactTabsTab}>Your Minted NFTs</Tab>
					<Tab className={styles.reactTabsTab}>Your Active Auctions</Tab>
					<Tab className={styles.reactTabsTab}>Sold</Tab>
					<Tab className={styles.reactTabsTab}>Marketplace</Tab>
				</TabList>
				<TabPanel className={styles.tabContent}>{renderUsersNFTs(nfts, auctions)}</TabPanel>
				<TabPanel className={styles.tabContent}>{renderUsersActiveAuctions(nfts, auctions)}</TabPanel>
				<TabPanel className={styles.tabContent}></TabPanel>
				<TabPanel className={styles.tabContent}></TabPanel>
			</Tabs>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		web3: web3Selector(state),
		account: accountSelector(state),
		nftContractLoaded: nftLoadedSelector(state),
		nftContract: nftSelector(state),
		nfts: mintedNFTsSelector(state),
		auctions: allAuctionsSelector(state),
		auctionsLoaded: allAuctionsLoadedSelector(state),
	};
}

export default connect(mapStateToProps)(Auction);
