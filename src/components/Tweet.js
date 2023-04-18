import { connect, useDispatch } from 'react-redux';
import { useState } from 'react';
import Tipper from './Tipper';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from '@components/styles/Tweet.module.css';
import { likeTweet } from '@components/store/interactions';
import { allTweetsSelector, twitterSelector, accountSelector, allProfilesSelector } from '@components/store/selectors';
import Comment from './Comment';

const Tweet = ({
	id,
	name,
	address,
	content,
	likes,
	retweets,
	tips,
	tipCount,
	profilePic,
	time,
	twitter,
	account,
	commentDialogOpen,
}) => {
	const dispatch = useDispatch();

	const [commentCount, setCommentCount] = useState(0);
	const [showCommentDialog, setShowCommentDialog] = useState(false);
	const [liked, setLiked] = useState(false);
	const [showTipper, setShowTipper] = useState(false);
	const [tipped, setTipped] = useState(false);
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
						<span className={styles.actions}>
							{showCommentDialog ? (
								<Comment
									name={name}
									address={address}
									content={content}
									time={time}
									profilePic={profilePic}
									showCommentDialog={showCommentDialog}
									commentCount={commentCount}
									setCommentCount={setCommentCount}
									onClose={handleCloseCommentDialog}
								/>
							) : (
								<>
									<FontAwesomeIcon icon={faComment} size='lg' onClick={handleShowCommentDialog} />
									<span>{commentCount}</span>
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
	return {
		twitter: twitterSelector(state),
		account: accountSelector(state),
		tweets: allTweetsSelector(state),
	};
}

export default connect(mapStateToProps)(Tweet);
