import AuctionABI from '../abis/Auction.json';
import styles from '@components/styles/Auction.module.css';
import NFTCard from '@components/components/NFTCard';
import UsersActiveAuctionsCard from '@components/components/UsersActiveAuctionCard';
import MarketplaceCard from '@components/components/MarketplaceCard';
import { useEffect, useState, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import 'react-tabs/style/react-tabs.css';
import {
	startAuction,
	loadMintedNFTs,
	loadAllAuctions,
	subscribeToAuctionEvents,
	getActiveAuction,
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
	const [auctionInstances, setAuctionInstances] = useState([]);
	const [auctionEnded, setAuctionEnded] = useState(false);

	// LOADS MINTED NFTS AND ALL AUCTIONS
	const loadBlockchainData = async (nftContract, dispatch) => {
		await loadMintedNFTs(nftContract, dispatch);
		await loadAllAuctions(nftContract, dispatch, web3);
	};

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
	}, [auctions, auctionsLoaded, auctionEnded]);

	// ENSURES TIMER RENDERS IMMEDIATELY AFTER AUCTION START
	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
	}, [toggleAuctionActivation]);

	// CREATE NEW AUCTION INSTANCE FOR EACH AUCTION
	const createAuctionInstance = (abi, address) => new web3.eth.Contract(abi, address);

	// REMOVES AUCTION INSTANCE WHEN AUCTION ENDS
	const removeAuctionInstance = (endedAuctionAddress) => {
		setAuctionInstances((prevAuctionInstances) =>
			prevAuctionInstances.filter((instance) => instance.options.address !== endedAuctionAddress),
		);
	};

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
					web3={web3}
					account={account}
					contract={nftContract}
					dispatch={dispatch}
					nft={nft}
					auction={auction}
					loading={loading}
					handleAuctionStart={handleAuctionStart}
					auctionEnded={auctionEnded}
					setAuctionEnded={setAuctionEnded}
					removeAuctionInstance={removeAuctionInstance}
					auctionInstances={auctionInstances}
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
			if (auction) {
				const auctionInstance = auctionInstances.find(
					(instance) => instance.options.address === auction.auctionAddress,
				);

				if (auctionInstance) {
					cards.push(
						<UsersActiveAuctionsCard
							key={nft.id}
							web3={web3}
							account={account}
							nft={nft}
							auction={auction}
							auctionInstance={auctionInstance}
							auctionEnded={auctionEnded}
							setAuctionEnded={setAuctionEnded}
						/>,
					);
				}
			}
		}

		return cards;
	};

	const renderMarketplace = (nfts, auctions) => {
		const activeAuctions = auctions.filter((auction) => auction.seller !== account);
		const cards = [];

		for (const auction of activeAuctions) {
			const matchingNFT = nfts.find((nft) => nft.id === auction.nftId);

			if (auction) {
				const auctionInstance = auctionInstances.find(
					(instance) => instance.options.address === auction.auctionAddress,
				);

				if (auctionInstance) {
					cards.push(
						<MarketplaceCard
							key={auction.nftId}
							web3={web3}
							account={account}
							id={auction.nftId}
							nft={matchingNFT}
							auction={auction}
							contract={auctionInstance}
							endTime={auction.endTime * 1000}
						/>,
					);
				}
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
				<TabPanel className={styles.tabContent}>{renderMarketplace(nfts, auctions)}</TabPanel>
			</Tabs>
		</div>
	);
};

function mapStateToProps(state) {
	console.log({ nfts: mintedNFTsSelector(state) });
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
