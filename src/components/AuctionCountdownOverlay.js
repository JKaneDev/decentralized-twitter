import styles from '@components/styles/Auction.module.css';
import Countdown from 'react-countdown';
import Auction from '../abis/Auction.json';
import { endAuction } from '@components/store/interactions';
import { useDispatch } from 'react-redux';
import moment from 'moment';

const AuctionCountdownOverlay = ({ web3, account, id, auction, auctionEnded, setAuctionEnded, endTime, duration }) => {
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

	const userDate = new Date();
	const offsetInMinutes = userDate.getTimezoneOffset();
	const offsetInHours = -(offsetInMinutes / 60);
	const AESTOffset = 10;
	const hoursDifference = AESTOffset - offsetInHours;
	const secondsDifference = hoursDifference * 60 * 60;
	const endTimeAdjusted = endTime - secondsDifference;

	console.log('userDate: ', userDate);
	console.log('offsetInMinutes:', offsetInMinutes);
	console.log('offsetInHours:', offsetInHours);
	console.log('AESTOffset:', AESTOffset);
	console.log('hoursDifference:', hoursDifference);
	console.log('secondsDifference:', secondsDifference);
	console.log('endTime without adjustments:', endTime);
	console.log('EndTime without adjustments formatted:', moment.unix(endTime).format('MMMM Do YYYY, h:mm:ss a'));
	console.log('endTimeAdjusted:', endTimeAdjusted);
	console.log('EndTime without adjustments formatted:', moment.unix(endTimeAdjusted).format('MMMM Do YYYY, h:mm:ss a'));

	return (
		<div className={styles.auctionCountdownOverlay}>
			<Countdown date={endTimeAdjusted * 1000} renderer={renderer} onComplete={handleCountdownComplete} />
		</div>
	);
};

export default AuctionCountdownOverlay;
