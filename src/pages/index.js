import styles from '@components/styles/Home.module.css';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { loadWeb3, loadAccount, loadTweetToken, loadTweetNFT, loadTwitter } from '../store/interactions';
import Sidebar from '../components/Sidebar';
import CreateTweet from '@components/components/CreateTweet';
import Feed from '@components/components/Feed';

const Home = (props) => {
	useEffect(() => {
		loadBlockchainData(props.dispatch);
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
	);
};

function mapStateToProps(state) {
	return {};
}

export default connect(mapStateToProps)(Home);
