import styles from '@components/styles/Auction.module.css';
import { connect, useDispatch } from 'react-redux';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import 'react-tabs/style/react-tabs.css';
import { accountSelector, mintedNFTsSelector, nftSelector } from '@components/store/selectors';
import { useEffect, useState } from 'react';
import { loadMintedNFTs } from '@components/store/interactions';
import { useRouter } from 'next/router';

const Auction = ({ nftContract, nfts, account }) => {
	const dispatch = useDispatch();
	const router = useRouter();

	const [cards, setCards] = useState([]);

	useEffect(() => {
		loadBlockchainData(nftContract, dispatch);
	}, []);

	useEffect(() => {
		if (nfts.length > 0) {
			fetchAndRenderNfts();
		}
	}, [nfts, account]);

	const fetchAndRenderNfts = async () => {
		const usersNfts = nfts.filter((nft) => nft.owner == account);
		const cards = [];

		for (const nft of usersNfts) {
			cards.push(
				<div key={nft.id} className={styles.nftCard}>
					<iframe src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
				</div>,
			);
		}
		setCards(cards);
	};

	const loadBlockchainData = async (nftContract, dispatch) => {
		await loadMintedNFTs(nftContract, dispatch);
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
	// console.log({
	// 	nftContract: nftSelector(state),
	// 	account: accountSelector(state),
	// 	nfts: mintedNFTsSelector(state),
	// });
	return {
		nftContract: nftSelector(state),
		account: accountSelector(state),
		nfts: mintedNFTsSelector(state),
	};
}
export default connect(mapStateToProps)(Auction);
