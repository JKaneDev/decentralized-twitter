import styles from '@components/styles/Auction.module.css';
import EndAuctionOverlay from '@components/components/EndAuctionOverlay';
import { endAuction } from '@components/store/interactions';

const UsersActiveAuctionsCard = ({ web3, account, nft, auction, auctionInstance }) => {
	return (
		<div key={nft.id} className={styles.nftCard}>
			<>
				<iframe src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
				<EndAuctionOverlay
					id={nft.id}
					web3={web3}
					auction={auction}
					auctionContract={auctionInstance}
					account={account}
					endTime={auction.endTime * 1000}
					endAuction={endAuction}
				/>
			</>
		</div>
	);
};

export default UsersActiveAuctionsCard;
