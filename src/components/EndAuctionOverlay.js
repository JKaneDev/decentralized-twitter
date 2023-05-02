import styles from '@components/styles/Auction.module.css';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import Countdown from 'react-countdown';
import { loadHighestBid, isAuctionEnded } from '@components/store/interactions';
import { bidsSelector } from '@components/store/selectors';

const EndAuctionOverlay = ({
	web3,
	id,
	auction,
	auctionContract,
	account,
	endTime,
	endAuction,
	auctionEnded,
	setAuctionEnded,
	bids,
}) => {
	const dispatch = useDispatch();

	const [highestBid, setHighestBid] = useState(null);
	const [ended, setEnded] = useState(false);

	// SET HIGHEST BID ON FIRST COMPONENT RENDER
	useEffect(() => {
		loadBlockchainData(auctionContract);
	}, []);

	// RERENDER EACH TIME A NEW BID IS MADE - UPDATE HIGHEST BID
	useEffect(() => {
		loadBlockchainData(auctionContract);
	}, [bids]);

	// RERENDER CARD WHEN ENDED STATUS CHANGES
	useEffect(() => {
		checkAuctionStatus();
	}, [ended]);

	const checkAuctionStatus = async () => {
		const ended = await isAuctionEnded(web3, auction);
		setEnded(ended);
	};

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
			{ended ? <span>0:0:0</span> : <Countdown date={endTime} renderer={renderer} />}

			<span className={styles.highestBid}>Highest Bid: {highestBid} ETH</span>
			<button
				className={styles.endAuctionBtn}
				onClick={async () => {
					await endAuction(auctionContract, account, id, dispatch);
					setAuctionEnded(!auctionEnded);
				}}
				disabled={ended}
				style={{ backgroundColor: ended ? 'rgb(55, 0, 0)' : 'rgb(135, 0, 0)' }}
			>
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
