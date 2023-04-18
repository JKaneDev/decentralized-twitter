import { connect } from 'react-redux';
import styles from '@components/styles/Sidebar.module.css';
import dynamic from 'next/dynamic';
import { faUser, faSearch, faBell, faEnvelope, faHome, faBookmark, faCoins } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { getTweetTokenBalance } from '@components/store/interactions';

const FontAwesomeIcon = dynamic(
	() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon),
	{
		ssr: false,
	},
);
const Sidebar = () => {
	return (
		<section className={styles.sidebar}>
			<FontAwesomeIcon icon={faTwitter} size='2x' />
			<FontAwesomeIcon icon={faHome} size='lg' />
			<FontAwesomeIcon icon={faSearch} size='lg' />
			<FontAwesomeIcon icon={faBell} size='lg' />
			<FontAwesomeIcon icon={faEnvelope} size='lg' />
			<FontAwesomeIcon icon={faUser} size='lg' />
			<FontAwesomeIcon icon={faBookmark} size='lg' />
			<FontAwesomeIcon icon={faCoins} size='lg' />
		</section>
	);
};

function mapStateToProps(state) {
	return {
		// TODO
	};
}

export default connect(mapStateToProps)(Sidebar);
