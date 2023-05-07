import { connect, useDispatch } from 'react-redux';
import styles from '@components/styles/CreateTweet.module.css';
import { createTweet } from '@components/store/interactions';
import { twitterSelector, accountSelector } from '@components/store/selectors';
import { useState } from 'react';
import { ClipLoader } from 'react-spinners';

const CreateTweet = ({ profilePic, twitter, account }) => {
	const [tweetContent, setTweetContent] = useState('');
	const [loading, setLoading] = useState(false);

	const dispatch = useDispatch();

	const onSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		await createTweet(twitter, account, dispatch, tweetContent, profilePic);
		setTweetContent('');
		setLoading(false);
	};

	return (
		<>
			{loading ? (
				<ClipLoader color='#00BFFF' size={50} />
			) : (
				<form onSubmit={onSubmit} className={styles.createTweet}>
					<img src={profilePic} alt='user-profile' className={styles.profilePic} />
					<section className={styles.section}>
						<textarea
							name='tweet-content'
							className={styles.tweetContent}
							placeholder='Write something here...'
							value={tweetContent}
							onChange={(e) => setTweetContent(e.target.value)}
						></textarea>
					</section>
					<button className={styles.tweetBtn} type='submit'>
						Tweet
					</button>
				</form>
			)}
		</>
	);
};

function mapStateToProps(state) {
	// console.log({
	// 	tweets: state,
	// });
	return {
		twitter: twitterSelector(state),
		account: accountSelector(state),
	};
}

export default connect(mapStateToProps)(CreateTweet);
