import { accountSelector, allProfilesSelector, twitterSelector } from '@components/store/selectors';
import { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import Tweet from './Tweet';
import styles from '@components/styles/CreateComment.module.css';
import { useEffect } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createComment } from '@components/store/interactions';

const CreateComment = ({
	id,
	users,
	account,
	name,
	address,
	content,
	time,
	profilePic,
	showCommentDialog,
	twitter,
	onClose,
}) => {
	const [commentContent, setCommentContent] = useState('');
	const [currentUserProfilePic, setCurrentUserProfilePic] = useState('');

	const dispatch = useDispatch();

	useEffect(() => {
		const currentUser = users.find((user) => user.userAddress === account);
		const profilePic = currentUser.profilePictureURL;
		setCurrentUserProfilePic(profilePic);
	}, []);

	const confirmComment = async (e) => {
		e.preventDefault();
		await createComment(twitter, account, dispatch, id, commentContent);
		setCommentContent('');
		onClose();
	};

	return (
		<>
			<div className={styles.overlay}></div>
			<div className={styles.commentDialogWrapper}>
				<FontAwesomeIcon icon={faTimes} className={styles.exit} onClick={onClose} />
				<Tweet
					name={name}
					id={id}
					profilePic={profilePic}
					address={address}
					content={content}
					time={time}
					commentDialogOpen={showCommentDialog}
				/>
				<form onSubmit={confirmComment} className={styles.comment}>
					<img src={currentUserProfilePic} alt='user-profile' className={styles.profilePic} />
					<section className={styles.section}>
						<textarea
							className={styles.replyContent}
							name='comment-content'
							placeholder='Tweet your reply'
							value={commentContent}
							onChange={(e) => setCommentContent(e.target.value)}
						/>
					</section>
					<button type='submit' className={styles.replyBtn}>
						Reply
					</button>
				</form>
			</div>
		</>
	);
};

function mapStateToProps(state) {
	return {
		twitter: twitterSelector(state),
		account: accountSelector(state),
		users: allProfilesSelector(state),
	};
}

export default connect(mapStateToProps)(CreateComment);
