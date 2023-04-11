import { allTweetsSelector, allTweetsLoadedSelector } from '@components/store/selectors';
import { connect } from 'react-redux';
import Tweet from './Tweet';

const renderTweets = (tweets) => {
	return (
		<div>
			{allTweets.map((tweet) => {
				return (
					<Tweet
						key={tweet.id}
						name={tweet.name}
						address={tweet.creator}
						content={tweet.content}
						likes={tweet.likeCount}
						retweets={tweet.retweetCount}
						tips={tweet.tips}
						tipCount={tweet.tipCount}
						profilePic={tweet.imageUrl}
						time={tweet.timestamp}
					/>
				);
			})}
		</div>
	);
};

const Feed = ({ allTweets, allTweetsLoaded }) => {
	console.log('Tweets: ', allTweets);
	return <main>{allTweetsLoaded ? renderTweets(allTweets) : <div></div>}</main>;
};

function mapStateToProps(state) {
	return {
		allTweets: allTweetsSelector(state),
		allTweetsLoaded: allTweetsLoadedSelector(state),
	};
}

export default connect(mapStateToProps)(Feed);
