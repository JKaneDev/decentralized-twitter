import { accountSelector, nftSelector, twitterSelector } from '@components/store/selectors';
import { mintNFT } from '@components/store/interactions';
import styles from '@components/styles/MintDialog.module.css';
import { connect, useDispatch } from 'react-redux';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toPng } from 'html-to-image';
import { useEffect } from 'react';

const MintDialog = ({ nftContract, account, closeMint, loading, setLoading, tweetRef, name, content }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		console.log('Loading', loading);
	}, [loading]);

	const handleMint = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Take snapshot of tweet component
			const dataUrl = await toPng(tweetRef.current);

			// Create nft metadata
			const metadata = {
				creator: `${name}`,
				content: `${content}`,
				image: '',
			};

			// Call ipfs api route
			const ipfsResponse = await fetch('/api/ipfs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ dataUrl, metadata }),
			});

			const { imageURI, metadataURI } = await ipfsResponse.json();

			// update metadata with image
			metadata.image = imageURI;

			// Pin the uploaded image using pinata by hash
			const pinataResponse = await fetch('/api/pinata', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ hash: metadataURI.split('/').pop() }),
			});

			if (pinataResponse.ok) {
				console.log('Pinata pin response:', await pinataResponse.json());
			} else {
				console.error('Error in pinning process:', await pinataResponse.json());
			}

			// Pass IPFS URI to mint function
			await mintNFT(nftContract, account, metadataURI, dispatch);
			setLoading(false);
		} catch (error) {
			console.error('Error in minting process: ', error);
		} finally {
			closeMint();
		}
	};

	return (
		<div className={styles.dialog}>
			<FontAwesomeIcon icon={faTimes} className={styles.exit} onClick={closeMint} />
			<p className={styles.text}>Confirm NFT Mint</p>
			<button onClick={handleMint} className={styles.btn}>
				Confirm
			</button>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		nftContract: nftSelector(state),
		account: accountSelector(state),
	};
}

export default connect(mapStateToProps)(MintDialog);
