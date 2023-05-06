import styles from '@components/styles/Comment.module.css';
import { faComment, faRetweet, faHeart, faHandHoldingUsd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';

const Comment = ({ comment, commenter, commenterName, profilePic, timestamp }) => {
	return (
		<div className={styles.comment}>
			<Image src={profilePic} alt='profile-pic' className={styles.profilePic} />
			<div className={styles.mainWrapper}>
				<span className={styles.commentInfo}>
					<span className={styles.name}>{commenterName}</span>
					<span className={styles.address}>{commenter}</span>
					<span className={styles.time}>{timestamp}</span>
				</span>
				<p className={styles.commentContent}>{comment}</p>
				<span className={styles.actionsWrapper}>
					<span className={styles.actions}>
						<FontAwesomeIcon icon={faComment} size='lg' id={styles.comment} />
						<span>0</span>
					</span>
					<span className={styles.actions}>
						<FontAwesomeIcon icon={faRetweet} size='lg' />
						<span>0</span>
					</span>
					<span className={styles.actions}>
						<FontAwesomeIcon icon={faHeart} size='lg' id={styles.like} />
						<span>0</span>
					</span>
					<span className={styles.actions}>
						<FontAwesomeIcon icon={faHandHoldingUsd} size='lg' id={styles.tip} />
						<span>0</span>
					</span>
				</span>
			</div>
		</div>
	);
};

export default Comment;
