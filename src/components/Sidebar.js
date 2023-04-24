import { connect } from 'react-redux';
import styles from '@components/styles/Sidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faBell, faEnvelope, faHome, faBookmark, faCoins } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

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
