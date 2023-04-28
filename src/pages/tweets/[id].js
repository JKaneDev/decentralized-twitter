import styles from '@components/styles/CommentPage.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { connect, useDispatch } from 'react-redux';
import Tweet from '@components/components/Tweet';
import Comment from '@components/components/Comment';
import { createComment } from '@components/store/interactions';
import {
	accountSelector,
	allProfilesLoadedSelector,
	allProfilesSelector,
	allTweetsLoadedSelector,
	allTweetsSelector,
	twitterSelector,
} from '@components/store/selectors';

const TweetPage = ({ twitter, users, usersLoaded, account, tweets, tweetsLoaded }) => {
	const dispatch = useDispatch();
	const router = useRouter();
	const { id } = router.query;

	const [reply, setReply] = useState('');

	// Find the tweet in the tweets array
	const tweet = tweets.find((tweet) => String(tweet.id) === id);

	const user = users.find((user) => user.userAddress === account);
	const userProfilePic = user.profilePictureURL;

	const confirmReply = (e) => {
		e.preventDefault();
		createComment(twitter, account, dispatch, tweet.id, reply);
		setReply('');
	};

	const backToFeed = () => {
		router.push(`/`);
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.back}>
				<button className={styles.backBtn} onClick={backToFeed}>
					<FontAwesomeIcon icon={faArrowLeft} size='sm' />
					Back
				</button>
			</div>
			<Tweet
				key={tweet.id}
				id={tweet.id}
				name={tweet.name}
				address={tweet.creator}
				content={tweet.content}
				comCount={tweet.comments.length}
				likeCount={tweet.likes.length}
				tipCount={tweet.tips.length}
				profilePic={tweet.imageUrl}
				time={tweet.timestamp}
			/>
			<form onSubmit={confirmReply} className={styles.commentBox}>
				<img src={userProfilePic} alt='user-profile-pic' className={styles.profilePic} />
				<textarea
					type='text'
					placeholder='Tweet your reply'
					value={reply}
					onChange={(e) => setReply(e.target.value)}
					className={styles.reply}
				/>
				<button type='submit' value={reply} className={styles.replyBtn}>
					Reply
				</button>
			</form>
			{tweet.comments.map((comment, index) => (
				<Comment
					key={index}
					comment={comment.comment}
					commenter={comment.commenter}
					commenterName={comment.commenterName}
					profilePic={comment.profilePic}
					timestamp={comment.timestamp}
				/>
			))}
		</div>
	);
};

function mapStateToProps(state) {
	return {
		twitter: twitterSelector(state),
		users: allProfilesSelector(state),
		usersLoaded: allProfilesLoadedSelector(state),
		account: accountSelector(state),
		tweets: allTweetsSelector(state),
		tweetsLoaded: allTweetsLoadedSelector(state),
	};
}

export default connect(mapStateToProps)(TweetPage);
