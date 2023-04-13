import styles from '@components/styles/Home.module.css';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { loadWeb3, loadAccount, loadTweetToken, loadTweetNFT, loadTwitter, loadProfiles } from '../store/interactions';
import { web3Selector, accountSelector, allProfilesSelector } from '../store/selectors';
import Sidebar from '../components/Sidebar';
import CreateTweet from '@components/components/CreateTweet';
import Feed from '@components/components/Feed';
import CreateProfile from '@components/components/CreateProfile';

const Home = ({ account, users }) => {
	const [accountCreated, setAccountCreated] = useState(false);

	const dispatch = useDispatch();

	useEffect(() => {
		loadBlockchainData(dispatch);
	}, []);

	const hasProfile =
		accountCreated ||
		(Array.isArray(users.allProfiles.data) &&
			users.allProfiles.data.some((profile) => profile.userAddress === account));

	const handleAccountCreated = () => setProfileCreated(true);

	async function loadBlockchainData(dispatch) {
		const web3 = await loadWeb3(dispatch);
		const networkId = await web3.eth.net.getId();
		await loadAccount(web3, dispatch);
		const tweetToken = await loadTweetToken(web3, networkId, dispatch);
		const tweetNFT = await loadTweetNFT(web3, networkId, dispatch);
		const twitter = await loadTwitter(web3, networkId, dispatch);
		await loadProfiles(twitter, dispatch);
	}

	return (
		<>
			{!account ? (
				// Show a loading indicator or message while waiting for the account to load
				<div>Loading...</div>
			) : !hasProfile ? (
				// Render the CreateProfile component if the account is loaded and userAddress is not in state.users
				<CreateProfile setAccountCreated={setAccountCreated} />
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
	console.log({
		account: accountSelector(state),
		users: allProfilesSelector(state),
	});
	return {
		account: accountSelector(state),
		users: state.users,
	};
}

export default connect(mapStateToProps)(Home);
