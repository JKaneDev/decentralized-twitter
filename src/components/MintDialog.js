import { accountSelector, nftSelector, twitterSelector } from '@components/store/selectors';
import { mintNFT } from '@components/store/interactions';
import styles from '@components/styles/MintDialog.module.css';
import { connect, useDispatch } from 'react-redux';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { create } from 'ipfs-http-client';
import { toPng } from 'html-to-image';

const MintDialog = ({ nftContract, account, closeMint, setLoading, tweetRef, name, content }) => {
	const dispatch = useDispatch();

	// IPFS credentials
	const projectId = process.env.NEXT_PUBLIC_API_KEY;
	const projectSecret = process.env.NEXT_PUBLIC_SECRET_API_KEY;
	const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

	// Create the IPFS instance
	const ipfs = create({
		url: `https://ipfs.infura.io:5001/api/v0`,
		protocol: 'https',
		headers: {
			Authorization: auth,
		},
	});

	const handleMint = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Take snapshot of tweet component
			const dataUrl = await toPng(tweetRef.current);

			// Upload snapshot image to IPFS
			const imageResponse = await ipfs.add(dataUrl);

			// Return generated IPFS URI
			const ipfsURI = `https://ipfs.io/ipfs/${imageResponse.path}`;

			// Create nft metadata
			const metadata = {
				creator: `${name}`,
				content: `${content}`,
				image: ipfsURI,
			};

			// Upload the metadata JSON to IPFS:
			const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
			const metadataResponse = await ipfs.add(metadataBlob);
			const metadataURI = `https://ipfs.io/ipfs/${metadataResponse.path}`;

			// Pin the uploaded image using pinata
			const pinataResponse = await fetch('/api/pinata', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ hash: metadataResponse.path }),
			});

			console.log('Response: ', pinataResponse);
			if (pinataResponse.ok) {
				console.log('Pinata pin response:', await pinataResponse.json());
			} else {
				console.error('Error in pinning process:', await pinataResponse.json());
			}

			// Pass IPFS URI to mint function
			await mintNFT(nftContract, account, ipfsURI, dispatch);
		} catch (error) {
			console.error('Error in minting process: ', error);
		} finally {
			setLoading(false);
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
