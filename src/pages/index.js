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
import { accountSelector, allProfilesSelector, web3Selector } from '../store/selectors';
import Sidebar from '../components/Sidebar';
import CreateProfile from '@components/components/CreateProfile';
import CreateTweet from '@components/components/CreateTweet';
import Feed from '@components/components/Feed';
import { ClipLoader } from 'react-spinners';

const Home = ({ web3, account, users }) => {
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

		if (twitter && tweetToken && tweetNFT) {
			await loadProfiles(web3, twitter, dispatch);
			await subscribeToTwitterEvents(twitter, dispatch);
			console.log('Profiles Loaded');
		} else {
			console.log('Smart contracts unavailable, unable to load profiles or subscribe to events');
		}
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
				<div className={styles.loaderWrapper}>
					<ClipLoader color='#00BFFF' size={100} />
				</div>
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
								<Feed web3={web3} />
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
		web3: web3Selector(state),
		account: accountSelector(state),
		users: allProfilesSelector(state),
	};
}

export default connect(mapStateToProps)(Home);
