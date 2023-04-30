import AuctionABI from '../abis/Auction.json';
import styles from '@components/styles/Auction.module.css';
import OverlayContent from '@components/components/OverlayContent';
import EndAuctionOverlay from '@components/components/EndAuctionOverlay';
import AuctionCountdownOverlay from '@components/components/AuctionCountdownOverlay';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ClipLoader } from 'react-spinners';
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
} from '@components/store/interactions';
import {
	accountSelector,
	allAuctionsSelector,
	mintedNFTsSelector,
	nftSelector,
	allAuctionsLoadedSelector,
	web3Selector,
} from '@components/store/selectors';

const Auction = ({ web3, nftContract, nfts, account, auctions, auctionsLoaded }) => {
	const dispatch = useDispatch();
	const router = useRouter();

	const [cards, setCards] = useState([]);
	const [activeAuctionCards, setActiveAuctionCards] = useState([]);
	const [loading, setLoading] = useState(false);
	const [toggleAuctionActivation, setToggleAuctionActivation] = useState(false);
	const [auctionInstances, setAuctionInstances] = useState([]);

	// ON FIRST RENDER
	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
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
		loadAuctionInstances(auctions);
	}, [auctions]);

	// ENSURES TIMER RENDERS IMMEDIATELY AFTER AUCTION START
	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
	}, [toggleAuctionActivation]);

	// LOADS MINTED NFTS AND ALL AUCTIONS
	const loadBlockchainData = async (nftContract, dispatch) => {
		await loadMintedNFTs(nftContract, dispatch);
		await loadAllAuctions(nftContract, dispatch);
	};

	// INITIALIZE WEB3 INSTANCES FOR ALL AUCTIONS
	const loadAuctionInstances = async (auctions) => {
		const instances = await Promise.all(
			auctions.map((auction) => createAuctionInstance(AuctionABI.abi, auction.auctionAddress)),
		);
		setAuctionInstances(instances);
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

	// SHOWS START AUCTION DIALOG OVERLAY IF THE NFT HAS NOT BEEN TO AUCTION OR IF THE AUCTION IS OVER
	const shouldShowStartAuctionOverlay = (auction) => !auction || (auction && auction.endTime * 1000 < Date.now());

	// BRING USER BACK TO FEED
	const backToFeed = () => {
		router.push(`/`);
	};

	// FETCH NFTS THAT BELONG TO USER, RENDER TO DOM
	const renderUsersNFTs = (nfts, auctions) => {
		const usersNfts = nfts.filter((nft) => nft.owner == account);
		const cards = [];

		for (const nft of usersNfts) {
			const auction = auctions.find((auction) => auction.nftId === nft.id);

			cards.push(
				// Hover over card to show start auction menu:
				<div
					key={nft.id}
					className={styles.nftCard}
					onMouseEnter={(e) => {
						if (shouldShowStartAuctionOverlay(auction)) {
							const overlay = e.currentTarget.querySelector(`.${styles.overlay}`);
							const iframe = e.currentTarget.querySelector(`.${styles.iframe}`);
							overlay.style.height = `${iframe.offsetHeight}px`;
							e.currentTarget.querySelector(`.${styles.overlay}`).classList.add(styles.visible);
						}
					}}
					onMouseLeave={(e) => {
						if (shouldShowStartAuctionOverlay(auction)) {
							e.currentTarget.querySelector(`.${styles.overlay}`).classList.remove(styles.visible);
						}
					}}
				>
					{/* Render Spinner if loading: */}
					{loading ? (
						<ClipLoader color='#00BFFF' size={50} />
					) : // Only render countdown if auction is still in progress:

					auction && auction.endTime * 1000 > Date.now() ? (
						<>
							<iframe src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
							<AuctionCountdownOverlay endTime={auction.endTime * 1000} onEndAuction={endAuction} />
						</>
					) : (
						// If auction is completed or not active, render default card and hover overlay:

						<>
							<iframe src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
							<div className={styles.overlay}>
								<OverlayContent
									nftId={nft.id}
									onStartAuction={(nftId, price, duration) =>
										handleAuctionStart(nftContract, dispatch, nftId, price, duration)
									}
								/>
							</div>
						</>
					)}
				</div>,
			);
		}
		setCards(cards);
	};

	// CREATE NEW AUCTION INSTANCE FOR EACH AUCTION
	const createAuctionInstance = (abi, address) => new web3.eth.Contract(abi, address);

	const renderUsersActiveAuctions = (nfts, auctions) => {
		const usersNfts = nfts.filter((nft) => nft.owner === account);
		const cards = [];

		for (const nft of usersNfts) {
			// AUCTIONS THAT BELONG TO THE USER
			const auction = auctions.find((auction) => auction.nftId === nft.id);

			if (!auction) {
				continue;
			}

			auctionInstances.forEach((instance) => {
				console.log('Instance Addresses:', instance._address);
			});

			// SMART CONTRACT INSTANCE
			const auctionInstance = auctionInstances.find((instance) => instance._address === auction.auctionAddress);
			console.log('Auction Instance:', auctionInstance);
			// CURRENTLY ACTIVE CHECK
			const currentlyActive = (auction) => auction && auction.nftId === nft.id && auction.endTime * 1000 > Date.now();

			cards.push(
				<div key={nft.id} className={styles.nftCard}>
					{currentlyActive(auction) ? (
						<>
							<iframe src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
							<EndAuctionOverlay
								auctionContract={auctionInstance}
								account={account}
								endTime={auction.endTime * 1000}
								onEndAuction={endAuction}
							/>
						</>
					) : (
						<div></div>
					)}
				</div>,
			);
		}
		setActiveAuctionCards(cards);
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
				<TabPanel className={styles.tabContent}>{cards}</TabPanel>
				<TabPanel className={styles.tabContent}>{activeAuctionCards}</TabPanel>
				<TabPanel className={styles.tabContent}></TabPanel>
				<TabPanel className={styles.tabContent}></TabPanel>
			</Tabs>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		web3: web3Selector(state),
		nftContract: nftSelector(state),
		account: accountSelector(state),
		nfts: mintedNFTsSelector(state),
		auctions: allAuctionsSelector(state),
		auctionsLoaded: allAuctionsLoadedSelector(state),
	};
}

export default connect(mapStateToProps)(Auction);
