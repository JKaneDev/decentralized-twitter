import styles from '@components/styles/CommentPage.module.css';
import { allTweetsSelector } from '@components/store/selectors';
import { useRouter } from 'next/router';
import { connect } from 'react-redux';
import Tweet from '@components/components/Tweet';
import Comment from '@components/components/Comment';

const TweetPage = ({ tweets }) => {
	const router = useRouter();
	const { id } = router.query;

	// Find the tweet in the tweets array
	const tweet = tweets.find((tweet) => tweet.id === id);

	return (
		<div className={stye}>
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
			{tweet.comments.map((comment) => (
				<Comment
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
	console.log({
		tweets: allTweetsSelector(state),
	});
	return {
		tweets: allTweetsSelector(state),
	};
}

export default connect(mapStateToProps)(TweetPage);
