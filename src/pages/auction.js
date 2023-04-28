import styles from '@components/styles/Auction.module.css';
import { connect, useDispatch } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ClipLoader } from 'react-spinners';
import 'react-tabs/style/react-tabs.css';
import { startAuction } from '@components/store/interactions';
import { accountSelector, mintedNFTsSelector, nftSelector } from '@components/store/selectors';
import { useEffect, useState } from 'react';
import { loadMintedNFTs } from '@components/store/interactions';
import { useRouter } from 'next/router';
import Web3 from 'web3';

const OverlayContent = ({ nftId, onStartAuction }) => {
	const [price, setPrice] = useState(0);
	const [duration, setDuration] = useState(0);

	console.log('OverlayContent price:', price);
	console.log('OverlayContent duration:', duration);
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
						console.log('onClick price (wei):', startingPriceInWei);
						console.log('onClick duration:', auctionDurationInSeconds);
						onStartAuction(nftId, startingPriceInWei, auctionDurationInSeconds);
					}}
				>
					Start Auction
				</button>
			</div>
		</div>
	);
};

const Auction = ({ nftContract, nfts, account }) => {
	const dispatch = useDispatch();
	const router = useRouter();

	const [cards, setCards] = useState([]);
	const [loading, setLoading] = useState(false);
	const [auctionStarted, setAuctionStarted] = useState(false);

	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
	}, []);

	useEffect(() => {
		if (nfts.length > 0) {
			fetchAndRenderNfts();
		}
	}, [nfts, account]);

	const loadBlockchainData = async (nftContract, dispatch) => {
		await loadMintedNFTs(nftContract, dispatch);
	};

	const handleAuctionStart = async (nftContract, dispatch, nftId, startingPrice, auctionDuration) => {
		console.log('handleAuctionStart startingPrice:', startingPrice);
		console.log('handleAuctionStart auctionDuration:', auctionDuration);
		setLoading(true);
		await startAuction(nftContract, account, dispatch, nftId, startingPrice, auctionDuration);
		setLoading(false);
		setAuctionStarted(true);
	};

	const fetchAndRenderNfts = async () => {
		const usersNfts = nfts.filter((nft) => nft.owner == account);
		const cards = [];

		for (const nft of usersNfts) {
			cards.push(
				<div
					key={nft.id}
					className={styles.nftCard}
					onMouseEnter={(e) => {
						const overlay = e.currentTarget.querySelector(`.${styles.overlay}`);
						const iframe = e.currentTarget.querySelector(`.${styles.iframe}`);
						overlay.style.height = `${iframe.offsetHeight}px`;
						e.currentTarget.querySelector(`.${styles.overlay}`).classList.add(styles.visible);
					}}
					onMouseLeave={(e) => {
						e.currentTarget.querySelector(`.${styles.overlay}`).classList.remove(styles.visible);
					}}
				>
					{loading ? (
						<ClipLoader color='#00BFFF' size={50} />
					) : (
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
					<Tab className={styles.reactTabsTab}>At Auction</Tab>
					<Tab className={styles.reactTabsTab}>Sold</Tab>
					<Tab className={styles.reactTabsTab}>Active Auctions</Tab>
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
	};
}
export default connect(mapStateToProps)(Auction);
