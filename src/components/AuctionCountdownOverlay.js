import styles from '@components/styles/Auction.module.css';
import Countdown from 'react-countdown';

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

export default AuctionCountdownOverlay;
