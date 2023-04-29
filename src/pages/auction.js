import Web3 from 'web3';
import Countdown from 'react-countdown';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import styles from '@components/styles/Auction.module.css';
import { ClipLoader } from 'react-spinners';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import 'react-tabs/style/react-tabs.css';
import { startAuction, endAuction, loadMintedNFTs, loadAllAuctions } from '@components/store/interactions';
import {
	accountSelector,
	allAuctionsSelector,
	mintedNFTsSelector,
	nftSelector,
	allAuctionsLoadedSelector,
} from '@components/store/selectors';

const OverlayContent = ({ nftId, onStartAuction }) => {
	const [price, setPrice] = useState(0);
	const [duration, setDuration] = useState(0);
	const [auctionEndTime, setAuctionEndTime] = useState(null);
	return (
		<div className={styles.overlayContent}>
			<div className={styles.labelWrapper}>
				<label className={styles.label} htmlFor='nftId'>
					NFT ID:
				</label>
				<span>{nftId}</span>
			</div>
			<div className={styles.fieldWrapper}>
				<div className={styles.priceWrapper}>
					<label className={styles.fieldLabels}>Starting Price:</label>
					<input
						className={styles.inputFields}
						id={styles.priceField}
						type='number'
						placeholder='Starting Price (ETH)'
						value={price}
						onChange={(e) => setPrice(e.target.value)}
					/>
				</div>
				<div className={styles.durationWrapper}>
					<label className={styles.fieldLabels}>Auction Duration (Hours):</label>
					<input
						className={styles.inputFields}
						type='number'
						placeholder='Auction Duration (Hours)'
						value={duration}
						onChange={(e) => setDuration(e.target.value)}
					/>
				</div>
				<button
					className={styles.btn}
					onClick={() => {
						const startingPriceInWei = Web3.utils.toWei(price, 'ether');
						const auctionDurationInSeconds = duration * 3600;
						onStartAuction(nftId, startingPriceInWei, auctionDurationInSeconds);
					}}
				>
					Start Auction
				</button>
			</div>
		</div>
	);
};

const AuctionCountdownOverlay = ({ endTime, onEndAuction }) => {
	const renderer = ({ hours, minutes, seconds, completed }) => {
		return (
			<span>
				{hours}:{minutes}:{seconds}
			</span>
		);
	};

	return (
		<div className={styles.auctionCountdownOverlay}>
			<Countdown date={endTime} renderer={renderer} />
		</div>
	);
};

const Auction = ({ nftContract, nfts, account, auctions, auctionsLoaded }) => {
	const dispatch = useDispatch();
	const router = useRouter();

	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(false);
	const [toggleAuctionActivation, setToggleAuctionActivation] = useState(false);

	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
	}, []);

	useEffect(() => {
		if (nfts.length > 0 && auctionsLoaded) {
			fetchAndRenderNfts();
		}
	}, [nfts, account]);

	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
	}, [toggleAuctionActivation]);

	const loadBlockchainData = async (nftContract, dispatch) => {
		await loadMintedNFTs(nftContract, dispatch);
		await loadAllAuctions(nftContract, dispatch);
	};

	const handleAuctionStart = async (nftContract, dispatch, nftId, startingPrice, auctionDuration) => {
		setLoading(true);
		await startAuction(nftContract, account, dispatch, nftId, startingPrice, auctionDuration);
		setToggleAuctionActivation(!toggleAuctionActivation);
		setLoading(false);
	};

	const shouldShowOverlay = (auction) => !auction || (auction && auction.endTime * 1000 < Date.now());

	const fetchAndRenderNfts = async () => {
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
						if (shouldShowOverlay(auction)) {
							const overlay = e.currentTarget.querySelector(`.${styles.overlay}`);
							const iframe = e.currentTarget.querySelector(`.${styles.iframe}`);
							overlay.style.height = `${iframe.offsetHeight}px`;
							e.currentTarget.querySelector(`.${styles.overlay}`).classList.add(styles.visible);
						}
					}}
					onMouseLeave={(e) => {
						if (shouldShowOverlay(auction)) {
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

	const backToFeed = () => {
		router.push(`/`);
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
				<TabPanel className={styles.tabContent}></TabPanel>
				<TabPanel className={styles.tabContent}></TabPanel>
				<TabPanel className={styles.tabContent}></TabPanel>
			</Tabs>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		nftContract: nftSelector(state),
		account: accountSelector(state),
		nfts: mintedNFTsSelector(state),
		auctions: allAuctionsSelector(state),
		auctionsLoaded: allAuctionsLoadedSelector(state),
	};
}
export default connect(mapStateToProps)(Auction);
