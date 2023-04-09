import styles from '@components/styles/Home.module.css';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { loadWeb3, loadAccount, loadTweetToken, loadTweetNFT, loadTwitter } from '../store/interactions';

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
		<>
			<section className='sidebar'>
				<button className='nav-links' id='home'></button>
				<button className='nav-links' id='search'></button>
				<button className='nav-links' id='notifications'></button>
				<button className='nav-links' id='messages'></button>
				<button className='nav-links' id='bookmarks'></button>
				<button className='nav-links' id='profile'></button>
				<button className='nav-links' id='log-out'></button>
			</section>
			<main className='feed'>
				<div className='tweet'>
					<img src='' alt='user-profile' className='user-profile' />
					<textarea name='tweet-content' id='tweet-content'></textarea>
				</div>
			</main>
		</>
	);
};

function mapStateToProps(state) {
	return {};
}

export default connect(mapStateToProps)(Home);
