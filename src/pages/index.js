import styles from '@components/styles/Home.module.css';
import { connect } from 'react-redux';
import { loadWeb3, loadAccount, loadTweetToken, loadTweetNFT, loadTwitter, loadAuction } from '../store/interactions';

async function loadBlockchainData(dispatch) {
	const web3 = await loadWeb3(dispatch);
	const networkId = await web3.eth.net.getId();
	await loadAccount(web3, dispatch);
	const tweetToken = await loadTweetToken(web3, networkId, dispatch);
	const tweetNFT = await loadTweetNFT(web3, networkId, dispatch);
	const twitter = await loadTwitter(web3, networkId, dispatch);

	return { tweetToken, tweetNFT, twitter };
}

const Home = ({ tweetToken, tweetNFT, twitter }) => {
	return <></>;
};

function mapStateToProps(state) {
	return {};
}

export async function getServerSideProps() {
	const dispatch = useDispatch();
	const blockchainData = await loadBlockchainData(dispatch);

	return {
		props: {
			tweetToken: blockchainData.tweetToken,
			tweetNFT: blockchainData.tweetNFT,
			twitter: blockchainData.twitter,
		},
	};
}

export default connect(mapStateToProps)(Home);
