import { connect } from 'react-redux';
import Tweet from './Tweet';

const Feed = () => {
	return (
		<main>
			<Tweet />
		</main>
	);
};

function mapStateToProps(state) {
	return {
		// TODO
	};
}

export default connect(mapStateToProps)(Feed);
