import styles from '@components/styles/Auction.module.css';
import Countdown from 'react-countdown';
import Auction from '../abis/Auction.json';
import { endAuction } from '@components/store/interactions';
import { useDispatch } from 'react-redux';

const AuctionCountdownOverlay = ({ web3, account, id, auction, auctionEnded, setAuctionEnded, endTime }) => {
	const dispatch = useDispatch();

	const renderer = ({ hours, minutes, seconds }) => {
		return (
			<span>
				{hours}:{minutes}:{seconds}
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

	return (
		<div className={styles.auctionCountdownOverlay}>
			<Countdown date={endTime} renderer={renderer} onComplete={handleCountdownComplete} />
		</div>
	);
};

export default AuctionCountdownOverlay;
