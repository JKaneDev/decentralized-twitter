import styles from '@components/styles/Home.module.css';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { loadWeb3, loadAccount, loadTweetToken, loadTweetNFT, loadTwitter } from '../store/interactions';
import Sidebar from '../components/Sidebar';
import CreateTweet from '@components/components/CreateTweet';
import Feed from '@components/components/Feed';
import CreateProfile from '@components/components/CreateProfile';

const Home = ({ account, user }) => {
	const dispatch = useDispatch();
	useEffect(() => {
		loadBlockchainData(dispatch);
	}, []);

	async function loadBlockchainData(dispatch) {
		const web3 = await loadWeb3(dispatch);
		const networkId = await web3.eth.net.getId();
		await loadAccount(web3, dispatch);
		const tweetToken = await loadTweetToken(web3, networkId, dispatch);
		const tweetNFT = await loadTweetNFT(web3, networkId, dispatch);
		const twitter = await loadTwitter(web3, networkId, dispatch);
	}

	return (
		<>
			{!account ? (
				// Show a loading indicator or message while waiting for the account to load
				<div>Loading...</div>
			) : !user.userAddress ? (
				// Render the CreateProfile component if the account is loaded and userAddress is not in state.users
				<CreateProfile />
			) : (
				// Render the Home page if the account is loaded and userAddress exists in state.users
				<div className={styles.home}>
					<div className={styles.sidebar}>
						<Sidebar />
					</div>
					<div className={styles.content}>
						<div className={styles.createTweet}>
							<CreateTweet />
						</div>
						<div className={styles.feed}>
							<Feed />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

function mapStateToProps(state) {
	return {
		account: state.web3.account,
		user: state.users,
	};
}

export default connect(mapStateToProps)(Home);
