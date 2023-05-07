import styles from '@components/styles/Auction.module.css';
import Countdown from 'react-countdown';
import { useDispatch, connect } from 'react-redux';
import { useEffect, useState } from 'react';
import { loadHighestBid, placeBid, isAuctionEnded } from '@components/store/interactions';
import { bidsSelector } from '@components/store/selectors';
import { ClipLoader } from 'react-spinners';

const MarketplaceCard = ({ web3, account, id, nft, auction, contract, endTime, bids }) => {
	const [highestBid, setHighestBid] = useState(null);
	const [ended, setEnded] = useState(false);
	const [placingBid, setPlacingBid] = useState(false);
	const [bid, setBid] = useState('');
	const [bidPlaced, setBidPlaced] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadBlockchainData(contract);
	}, []);

	useEffect(() => {
		loadBlockchainData(contract);
	}, [bidPlaced]);

	const loadBlockchainData = async (auctionContract) => {
		const currentHighestBid = await loadHighestBid(auctionContract);
		const formatted = web3.utils.fromWei(currentHighestBid, 'ether');
		setHighestBid(formatted);
	};

	const renderer = ({ days, hours, minutes, seconds }) => {
		return (
			<span>
				{days}:{hours}:{minutes}:{seconds}
			</span>
		);
	};

	const handleBid = async (bid) => {
		setLoading(true);
		setPlacingBid(true);
		const ethAmount = web3.utils.toWei(bid.toString(), 'ether');
		await placeBid(contract, account, ethAmount);
		setPlacingBid(false);
		setBidPlaced(!bidPlaced);
		setLoading(false);
	};

	return (
		<>
			{loading ? (
				<ClipLoader color='#00BFFF' size={100} />
			) : (
				<div key={id} className={styles.nftCard}>
					<>
						<iframe src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
						<div className={styles.auctionCountdownOverlay}>
							{ended ? <span>0:0:0</span> : <Countdown date={endTime} renderer={renderer} />}
							<span className={styles.highestBid}>Highest Bid: {highestBid} ETH</span>
							<div className={styles.bidWrapper}>
								{placingBid ? (
									<ClipLoader color='#00BFFF' size={50} />
								) : (
									<>
										<input type='text' className={styles.priceInput} onChange={(e) => setBid(e.target.value)} />
										<button className={styles.bidBtn} onClick={() => handleBid(bid)} disabled={ended}>
											Bid
										</button>
									</>
								)}
							</div>
						</div>
					</>
				</div>
			)}
		</>
	);
};

function mapStateToProps(state) {
	return {
		bids: bidsSelector(state),
	};
}

export default connect(mapStateToProps)(MarketplaceCard);
