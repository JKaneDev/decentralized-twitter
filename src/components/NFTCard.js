import styles from '@components/styles/Auction.module.css';
import OverlayContent from '@components/components/OverlayContent';
import AuctionCountdownOverlay from '@components/components/AuctionCountdownOverlay';
import { ClipLoader } from 'react-spinners';
import { useEffect, useRef, useState } from 'react';
import { isAuctionEnded } from '@components/store/interactions';

const NFTCard = ({
	web3,
	contract,
	dispatch,
	nft,
	auction,
	loading,
	handleAuctionStart,
	auctionEnded,
	setAuctionEnded,
	removeAuctionInstance,
	auctionInstances,
	auctions,
}) => {
	const overlayRef = useRef(null);
	const iframeRef = useRef(null);

	useEffect(() => {
		if (shouldShowStartAuctionOverlay(auction)) {
			const overlay = overlayRef.current;
			const iframe = iframeRef.current;
			if (overlay && iframe) {
				overlay.style.height = `${iframe.offsetHeight}px`;
			}
		}
	}, [auction]);

	useEffect(() => {
		const checkAuctionEnded = async () => {
			const ended = await isAuctionEnded(web3, auction);
			if (ended) {
				removeAuctionInstance(auction.auctionAddress);
			}
		};

		if (auction) {
			checkAuctionEnded();
		}
	}, [web3, auction, auctionEnded]);

	useEffect(() => {
		console.log('Ended (useEffect):', auctionEnded);
	}, [auctionEnded]);

	const toggleOverlay = (visible, iframeRef, overlayRef) => {
		if (shouldShowStartAuctionOverlay(auction)) {
			const overlay = overlayRef.current;
			if (overlay) {
				overlay.classList[visible ? 'add' : 'remove'](styles.visible);
			}
		}
	};

	// SHOWS START AUCTION DIALOG OVERLAY IF THE NFT HAS NOT BEEN TO AUCTION OR IF THE AUCTION IS OVER
	const shouldShowStartAuctionOverlay = (auction) =>
		!auction || (auction && auction.endTime * 1000 < Date.now() && auctionEnded);

	const isAuctionActive = (auction) => {
		console.log('Auctions:', auctions);
		console.log('Auction Instances:', auctionInstances);
		return auctionInstances.find((instance) => instance.options.address === auction.auctionAddress);
	};

	return (
		<div
			key={nft.id}
			className={styles.nftCard}
			onMouseEnter={() => toggleOverlay(true, iframeRef, overlayRef)}
			onMouseLeave={() => toggleOverlay(false, iframeRef, overlayRef)}
		>
			{/* Render Spinner if loading: */}
			{loading ? (
				<ClipLoader color='#00BFFF' size={50} />
			) : // Only render countdown if auction is still in progress:

			isAuctionActive(auction) ? (
				<>
					<iframe ref={iframeRef} src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
					<AuctionCountdownOverlay endTime={auction.endTime * 1000} />
				</>
			) : (
				// If auction is completed or not active, render default card and hover overlay:

				<>
					<iframe ref={iframeRef} src={nft.htmlURI} title={`NFT ${nft.id}`} className={styles.iframe}></iframe>
					<div ref={overlayRef} className={styles.overlay}>
						<OverlayContent
							nftId={nft.id}
							handleAuctionStart={(nftId, price, duration) =>
								handleAuctionStart(contract, dispatch, nftId, price, duration)
							}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default NFTCard;
