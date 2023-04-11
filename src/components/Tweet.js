import { connect } from 'react-redux';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '@components/styles/Tweet.module.css';

const Tweet = ({ name, address, content, likes, retweets, tips, tipCount, profilePic, time }) => {
	return (
		<div className={styles.tweet}>
			<img src={profilePic} alt='profile-pic' className='profile' />
			<span className={styles.tweetInfo}>
				<span className={styles.name}>{name}</span>
				<span className={styles.address}>{address}</span>
				<span className={styles.time}>{time}</span>
			</span>
			<p className={styles.tweetContent}>{content}</p>
			<span className={styles.actionsWrapper}>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faComment} size='lg' />
					<span>0</span>
				</span>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faRetweet} size='lg' />
					<span>{retweets}</span>
				</span>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faHeart} size='lg' />
					<span>{likes}</span>
				</span>
				<span className={styles.actions}>
					<FontAwesomeIcon icon={faHandHoldingUsd} size='lg' />
					<span>{tipCount}</span>
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
