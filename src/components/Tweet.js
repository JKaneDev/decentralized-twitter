import { connect, useDispatch } from 'react-redux';
import { useState } from 'react';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '@components/styles/Tweet.module.css';
import { likeTweet } from '@components/store/interactions';
import { allTweetsSelector, twitterSelector, accountSelector } from '@components/store/selectors';

const Tweet = ({ id, name, address, content, likes, retweets, tips, tipCount, profilePic, time, twitter, account }) => {
	const dispatch = useDispatch();

	const [liked, setLiked] = useState(false);
	const [tipped, setTipped] = useState(false);

	return (
		<div className={styles.tweet}>
			<img src={profilePic} alt='profile-pic' className={styles.profilePic} />
			<div className={styles.mainWrapper}>
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
					<span className={styles.actions} id={styles.retweet}>
						<FontAwesomeIcon icon={faRetweet} size='lg' />
						<span>{retweets}</span>
					</span>
					<span className={styles.actions} id={styles.like}>
						<FontAwesomeIcon
							icon={faHeart}
							size='lg'
							style={{ color: liked ? 'red' : '#757575' }}
							onClick={() => {
								likeTweet(twitter, account, dispatch, id);
								setLiked(!liked);
							}}
						/>
						<span style={{ color: liked ? 'red' : '#757575' }}>{likes}</span>
					</span>
					<span className={styles.actions} id={styles.tip}>
						<FontAwesomeIcon icon={faHandHoldingUsd} size='lg' />
						<span>{tipCount}</span>
					</span>
				</span>
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	console.log({
		tweets: allTweetsSelector(state),
	});
	return {
		twitter: twitterSelector(state),
		account: accountSelector(state),
		tweets: allTweetsSelector(state),
	};
}

export default connect(mapStateToProps)(Tweet);
