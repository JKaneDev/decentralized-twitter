import { connect } from 'react-redux';
import styles from '@components/styles/CreateTweet.module.css';

const CreateTweet = () => {
	return (
		<div className={styles.createTweet}>
			<img src='' alt='user-profile' className='user-profile' />
			<section className={styles.section}>
				<textarea name='tweet-content' className={styles.tweetContent} placeholder='Write something here...'></textarea>
			</section>
			<button className={styles.tweetBtn}>Tweet</button>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		// TODO
	};
}

export default connect(mapStateToProps)(CreateTweet);
