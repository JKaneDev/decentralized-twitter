import styles from '@components/styles/Auction.module.css';
import Countdown from 'react-countdown';
import Auction from '../abis/Auction.json';
import { endAuction } from '@components/store/interactions';
import { useDispatch } from 'react-redux';
import { adjustTimeForTimezone } from '@components/store/helpers';

const AuctionCountdownOverlay = ({ web3, account, id, auction, auctionEnded, setAuctionEnded, endTime }) => {
	const dispatch = useDispatch();

	const renderer = ({ days, hours, minutes, seconds }) => {
		return (
			<span>
				{days}:{hours}:{minutes}:{seconds}
			</span>
		);
	};

	const handleCountdownComplete = async () => {
		const auctionInstance = new web3.eth.Contract(Auction.abi, auction.auctionAddress);
		if (auction) {
			await endAuction(auctionInstance, account, id, dispatch);
			setAuctionEnded(!auctionEnded);
		}
	};

	// const endTimeAdjusted = adjustTimeForTimezone(endTime);

	return (
		<div className={styles.auctionCountdownOverlay}>
			<Countdown date={endTime} renderer={renderer} onComplete={handleCountdownComplete} />
		</div>
	);
};

export default AuctionCountdownOverlay;
