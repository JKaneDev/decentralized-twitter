import styles from '@components/styles/Auction.module.css';
import Web3 from 'web3';
import { useState } from 'react';

const OverlayContent = ({ nftId, handleAuctionStart }) => {
	const [price, setPrice] = useState(0);
	const [duration, setDuration] = useState(0);

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
						handleAuctionStart(nftId, startingPriceInWei, auctionDurationInSeconds);
					}}
				>
					Start Auction
				</button>
			</div>
		</div>
	);
};

export default OverlayContent;
