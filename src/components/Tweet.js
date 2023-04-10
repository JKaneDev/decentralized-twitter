import { connect } from 'react-redux';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '@components/styles/Tweet.module.css';

const Tweet = () => {
	return (
		<div className={styles.tweet}>
			<img src='' alt='profile-pic' className='profile' />
			<span className={styles.tweetInfo}>
				<span className={styles.name}>James Kane</span>
				<span className={styles.username}>@jtkanedev</span>
				<span className={styles.time}> . 5m</span>
			</span>
			<p className={styles.tweetContent}>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa temporibus maxime sed consectetur omnis, fugit
				libero error facere ullam amet.
			</p>
			<span className={styles.actionsWrapper}>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faComment} size='lg' />
					<span>10</span>
				</span>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faRetweet} size='lg' />
					<span>10</span>
				</span>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faHeart} size='lg' />
					<span>10</span>
				</span>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faHandHoldingUsd} size='lg' />
					<span>10</span>
				</span>
			</span>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		// TODO
	};
}

export default connect(mapStateToProps)(Tweet);
