import styles from '@components/styles/Comment.module.css';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Comment = ({ comment, commenter, commenterName, profilePic, timestamp }) => {
	return (
		<div className={styles.comment}>
			<img src={profilePic} alt='profile-pic' className={styles.profilePic} />
			<div className={styles.mainWrapper}>
				<span className={styles.commentInfo}>
					<span className={styles.name}>{commenterName}</span>
					<span className={styles.address}>{commenter}</span>
					<span className={styles.time}>{timestamp}</span>
				</span>
				<p className={styles.commentContent}>{comment}</p>
				<span className={styles.actionsWrapper}>
					<span className={styles.actions} style={{ color: commented ? '#1da1f2' : '#757575' }}>
						<FontAwesomeIcon icon={faComment} size='lg' onClick={handleShowCommentDialog} id={styles.comment} />
						<span>0</span>
					</span>
					<span className={styles.actions}>
						<FontAwesomeIcon icon={faRetweet} size='lg' />
						<span>0</span>
					</span>
					<span className={styles.actions}>
						<FontAwesomeIcon icon={faHeart} size='lg' id={styles.like} />
						<span style={{ color: liked ? 'red' : '#757575' }}>0</span>
					</span>
					<span className={styles.actions} style={{ color: tipped ? 'rgb(0, 148, 0)' : '#757575' }}>
						<FontAwesomeIcon icon={faHandHoldingUsd} size='lg' onClick={handleShowTipper} id={styles.tip} />
						<span>0</span>
					</span>
				</span>
			</div>
		</div>
	);
};

export default Comment;
