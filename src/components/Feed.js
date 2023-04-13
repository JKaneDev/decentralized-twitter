import { twitterSelector, allTweetsSelector, allTweetsLoadedSelector } from '@components/store/selectors';
import { connect } from 'react-redux';
import Tweet from './Tweet';
import { loadAllTweets } from '@components/store/interactions';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const renderTweets = (allTweets) => {
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

const Feed = ({ twitter, allTweets, allTweetsLoaded }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		loadBlockchainData(twitter, dispatch);
	}, []);

	// useEffect(async () => {
	// 	await loadAllTweets(twitter, dispatch);
	// }, [allTweets]);

	const loadBlockchainData = async (twitter, dispatch) => {
		await loadAllTweets(twitter, dispatch);
	};

	return <main>{allTweetsLoaded ? renderTweets(allTweets) : <div></div>}</main>;
};

function mapStateToProps(state) {
	return {
		allTweets: allTweetsSelector(state),
		allTweetsLoaded: allTweetsLoadedSelector(state),
		twitter: twitterSelector(state),
	};
}

export default connect(mapStateToProps)(Feed);
