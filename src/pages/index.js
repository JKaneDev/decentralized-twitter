import styles from '@components/styles/Home.module.css';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
	loadWeb3,
	loadAccount,
	loadTweetToken,
	loadTweetNFT,
	loadTwitter,
	loadProfiles,
	subscribeToTwitterEvents,
} from '../store/interactions';
import { accountSelector, allProfilesSelector } from '../store/selectors';
import Sidebar from '../components/Sidebar';
import CreateProfile from '@components/components/CreateProfile';
import CreateTweet from '@components/components/CreateTweet';
import Feed from '@components/components/Feed';

const Home = ({ account, users }) => {
	const [accountCreated, setAccountCreated] = useState(false);
	const [profilePic, setProfilePic] = useState('');
	const [showTokenHub, setShowTokenHub] = useState(false);

	const homeClass = showTokenHub ? `${styles.home} ${styles.expanded}` : styles.home;

	const dispatch = useDispatch();

	useEffect(() => {
		loadBlockchainData(dispatch);
	}, []);

	useEffect(() => {
		getProfilePicture();
	}, [users]);

	async function loadBlockchainData(dispatch) {
		const web3 = await loadWeb3(dispatch);
		const networkId = await web3.eth.net.getId();
		await loadAccount(web3, dispatch);
		const tweetToken = await loadTweetToken(web3, networkId, dispatch);
		const tweetNFT = await loadTweetNFT(web3, networkId, dispatch);
		const twitter = await loadTwitter(web3, networkId, dispatch);

		await loadProfiles(twitter, dispatch);
		await subscribeToTwitterEvents(twitter, dispatch);
	}

	const hasProfile = accountCreated || (users && users.some((profile) => profile.userAddress === account));

	const getProfilePicture = () => {
		if (users && users.length > 0) {
			const userProfile = users.find((user) => user.userAddress === account);
			if (userProfile) {
				setProfilePic(userProfile.profilePictureURL);
			}
		}
	};

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
				<div className={homeClass}>
					<div className={styles.sidebar}>
						<Sidebar showTokenHub={showTokenHub} setShowTokenHub={setShowTokenHub} />
					</div>
					<div className={styles.contentWrapper}>
						<div className={styles.content}>
							<div className={styles.createTweet}>
								<CreateTweet profilePic={profilePic} />
							</div>
							<div className={styles.feed}>
								<Feed />
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

function mapStateToProps(state) {
	return {
		account: accountSelector(state),
		users: allProfilesSelector(state),
	};
}

export default connect(mapStateToProps)(Home);
