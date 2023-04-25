import styles from '@components/styles/Tweet.module.css';
import Router from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { likeTweet, loadLikeData, loadCommentData, loadTipData } from '@components/store/interactions';
import { allTweetsSelector, twitterSelector, accountSelector, allProfilesSelector } from '@components/store/selectors';
import { ClipLoader } from 'react-spinners';
import Tipper from './Tipper';
import CreateComment from './CreateComment';
import MintDialog from './MintDialog';

const Tweet = ({
	id,
	name,
	address,
	content,
	comCount,
	likeCount,
	tipCount,
	profilePic,
	time,
	twitter,
	tweets,
	account,
	commentDialogOpen,
}) => {
	const dispatch = useDispatch();
	const tweetRef = useRef(null);

	const [commented, setCommented] = useState(false);
	const [liked, setLiked] = useState(false);
	const [tipped, setTipped] = useState(false);
	const [showCommentDialog, setShowCommentDialog] = useState(false);
	const [showTipper, setShowTipper] = useState(false);
	const [tipAmount, setTipAmount] = useState('');
	const [showMintDialog, setShowMintDialog] = useState(false);
	const [isTweetUsers, setIsTweetUsers] = useState(false);
	const [loading, setLoading] = useState(false);

	const loadBlockchainData = async (twitter, dispatch) => {
		await loadTipData(twitter, dispatch);
		await loadLikeData(twitter, dispatch);
		await loadCommentData(twitter, dispatch);
	};

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

	const handleShowMint = () => {
		setShowMintDialog(true);
	};

	const handleCloseMint = () => {
		setShowMintDialog(false);
	};

	const hasUserCommented = (userAddress, tweet) => {
		return tweet.comments.some((comment) => comment.commenter === userAddress);
	};

	const hasUserTipped = (userAddress, tweet) => {
		return tweet.tips.some((tip) => tip.tipper === userAddress);
	};

	const hasUserLiked = (userAddress, tweet) => {
		return tweet.likes.some((like) => like.liker === userAddress);
	};

	const checkUserInteractions = (tweets) => {
		const currentTweet = tweets.find((tweet) => tweet.id === id);
		if (currentTweet) {
			setCommented(hasUserCommented(account, currentTweet));
			setTipped(hasUserTipped(account, currentTweet));
			setLiked(hasUserLiked(account, currentTweet));
		}
	};

	const handleNavigation = () => {
		Router.push(`/tweets/${id}`);
	};

	useEffect(() => {
		loadBlockchainData(twitter, dispatch);
	}, []);

	useEffect(() => {
		const currentTweet = tweets.find((tweet) => tweet.id === id);
		if (currentTweet.creator === account) {
			setIsTweetUsers(true);
		}
	}, []);

	useEffect(() => {
		checkUserInteractions(tweets);
	}, [account, twitter, id, tweets]);

	return (
		<>
			{loading ? (
				<div className={styles.loading}>
					<ClipLoader color='#00BFFF' size={50} />
				</div>
			) : (
				<div className={styles.tweet} ref={tweetRef}>
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
								<span className={styles.actions} style={{ color: commented ? '#1da1f2' : '#757575' }}>
									{showCommentDialog ? (
										<CreateComment
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
											<FontAwesomeIcon
												icon={faComment}
												size='lg'
												onClick={handleShowCommentDialog}
												id={styles.comment}
											/>
											<span>{comCount}</span>
										</>
									)}
								</span>
								<span className={styles.actions}>
									<FontAwesomeIcon icon={faRetweet} size='lg' />
									<span>0</span>
								</span>
								<span className={styles.actions}>
									<FontAwesomeIcon
										icon={faHeart}
										size='lg'
										id={styles.like}
										style={{ color: liked ? 'red' : '#757575' }}
										onClick={() => {
											likeTweet(twitter, account, dispatch, id);
										}}
									/>
									<span style={{ color: liked ? 'red' : '#757575' }}>{likeCount}</span>
								</span>
								<span className={styles.actions} style={{ color: tipped ? 'rgb(0, 148, 0)' : '#757575' }}>
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
											<FontAwesomeIcon icon={faHandHoldingUsd} size='lg' onClick={handleShowTipper} id={styles.tip} />
											<span>{tipCount}</span>
										</>
									)}
								</span>
								<span className={styles.actions}>
									{showMintDialog && isTweetUsers ? (
										<MintDialog
											tweetId={id}
											closeMint={handleCloseMint}
											tweetRef={tweetRef}
											setLoading={setLoading}
											name={name}
											content={content}
										/>
									) : isTweetUsers ? (
										<FontAwesomeIcon icon={faEthereum} size='lg' onClick={handleShowMint} />
									) : (
										<></>
									)}
								</span>
							</span>
						)}
					</div>
					<div
						className={styles.navigateOverlay}
						onClick={handleNavigation}
						style={{ backgroundColor: showMintDialog ? 'rgba(0,0,0, 0.8)' : '' }}
					></div>
				</div>
			)}
		</>
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
