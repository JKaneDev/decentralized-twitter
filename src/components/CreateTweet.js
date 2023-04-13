import { connect } from 'react-redux';
import styles from '@components/styles/CreateTweet.module.css';

const CreateTweet = ({ profilePic }) => {
	return (
		<div className={styles.createTweet}>
			<img src={profilePic} alt='user-profile' className={styles.profilePic} />
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
