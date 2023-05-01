import styles from '@components/styles/Auction.module.css';
import EndAuctionOverlay from '@components/components/EndAuctionOverlay';

const UsersActiveAuctionsCard = ({ nft, auction, auctionInstance }) => {
	// CURRENTLY ACTIVE CHECK
	const currentlyActive = (auction) => auction && auction.nftId === nft.id && auction.endTime * 1000 > Date.now();

	return (
		<div key={nft.id} className={styles.nftCard}>
			{currentlyActive(auction) ? (
				<>
					<iframe src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
					<EndAuctionOverlay
						auctionContract={auctionInstance}
						account={account}
						endTime={auction.endTime * 1000}
						endAuction={endAuction}
					/>
				</>
			) : (
				<div></div>
			)}
		</div>
	);
};

export default UsersActiveAuctionsCard;
