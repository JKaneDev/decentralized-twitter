import { connect, useDispatch } from 'react-redux';
import { useState } from 'react';
import Tipper from './Tipper';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '@components/styles/Tweet.module.css';
import { likeTweet, loadLikeData, loadCommentData, loadTipData } from '@components/store/interactions';
import { allTweetsSelector, twitterSelector, accountSelector, allProfilesSelector } from '@components/store/selectors';
import Comment from './Comment';
import { useEffect } from 'react';

const Tweet = ({
	id,
	name,
	address,
	content,
	comCount,
	likes,
	retweets,
	tipCount,
	profilePic,
	time,
	twitter,
	tweets,
	account,
	commentDialogOpen,
}) => {
	const dispatch = useDispatch();

	const [commented, setCommented] = useState(false);
	const [retweeted, setRetweeted] = useState(false);
	const [liked, setLiked] = useState(false);
	const [tipped, setTipped] = useState(false);
	const [showCommentDialog, setShowCommentDialog] = useState(false);
	const [showTipper, setShowTipper] = useState(false);
	const [tipAmount, setTipAmount] = useState('');

	const handleShowCommentDialog = () => {
		setShowCommentDialog(true);
	};

	const handleCloseCommentDialog = () => {
		setShowCommentDialog(false);
	};

	const handleShowTipper = () => {
		setShowTipper(true);
	};

	const handleCloseTipper = () => {
		setShowTipper(false);
	};

	const hasUserCommented = (userAddress, tweet) => {
		return tweet.comments.some((comment) => comment.commenter.toLowerCase() === userAddress.toLowerCase());
	};

	const loadBlockchainData = async (twitter, dispatch) => {
		await loadTipData(twitter, dispatch);
		await loadLikeData(twitter, dispatch);
		await loadCommentData(twitter, dispatch);
	};

	const checkUserInteractions = (tweets) => {
		const currentTweet = tweets.find((tweet) => tweet.id === id);
		if (currentTweet) {
			setCommented(hasUserCommented(account, currentTweet));
		}
	};

	useEffect(() => {
		loadBlockchainData(twitter, dispatch);
		checkUserInteractions(tweets);
		// console.log(commented);
	}, [account, id, twitter, tweets]);

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
				{commentDialogOpen ? (
					<></>
				) : (
					<span className={styles.actionsWrapper}>
						<span className={styles.actions} id={styles.comment} style={{ color: commented ? '#1da1f2' : '#757575' }}>
							{showCommentDialog ? (
								<Comment
									id={id}
									name={name}
									address={address}
									content={content}
									time={time}
									profilePic={profilePic}
									showCommentDialog={showCommentDialog}
									onClose={handleCloseCommentDialog}
								/>
							) : (
								<>
									<FontAwesomeIcon icon={faComment} size='lg' onClick={handleShowCommentDialog} />
									<span>{comCount}</span>
								</>
							)}
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
							{showTipper ? (
								<Tipper
									id={id}
									tipped={tipped}
									setTipped={setTipped}
									amount={tipAmount}
									setAmount={setTipAmount}
									account={account}
									twitter={twitter}
									onClose={handleCloseTipper}
								/>
							) : (
								<>
									<FontAwesomeIcon
										icon={faHandHoldingUsd}
										size='lg'
										style={{ color: tipped ? 'rgb(0, 148, 0)' : '#757575' }}
										onClick={handleShowTipper}
									/>
									<span style={{ color: tipped ? 'rgb(0, 148, 0)' : '#757575' }}>{tipCount}</span>
								</>
							)}
						</span>
					</span>
				)}
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	// console.log({
	// 	tweets: allTweetsSelector(state),
	// });
	return {
		twitter: twitterSelector(state),
		account: accountSelector(state),
		tweets: allTweetsSelector(state),
	};
}

export default connect(mapStateToProps)(Tweet);
