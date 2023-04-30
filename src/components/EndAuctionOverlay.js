import styles from '@components/styles/Auction.module.css';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Countdown from 'react-countdown';
import { loadHighestBid } from '@components/store/interactions';
import { bidsSelector } from '@components/store/selectors';

const EndAuctionOverlay = ({ auctionContract, account, endTime, onEndAuction, bids }) => {
	const [highestBid, setHighestBid] = useState(null);

	// SET HIGHEST BID ON FIRST COMPONENT RENDER
	useEffect(() => {
		loadBlockchainData(auctionContract);
	}, []);

	// RERENDER EACH TIME A NEW BID IS MADE - UPDATE HIGHEST BID
	useEffect(() => {
		loadBlockchainData(auctionContract);
	}, [bids]);

	const loadBlockchainData = async (auctionContract) => {
		const currentHighestBid = await loadHighestBid(auctionContract);
		setHighestBid(currentHighestBid);
	};

	const renderer = ({ hours, minutes, seconds }) => {
		return (
			<span>
				{hours}:{minutes}:{seconds}
			</span>
		);
	};

	return (
		<div className={styles.auctionCountdownOverlay}>
			<Countdown date={endTime} renderer={renderer} />
			<span className={styles.highestBid}>Highest Bid: {highestBid} ETH</span>
			<button className={styles.endAuctionBtn} onClick={() => onEndAuction(auctionContract, account)}>
				End Auction
			</button>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		bids: bidsSelector(state),
	};
}

export default connect(mapStateToProps)(EndAuctionOverlay);
