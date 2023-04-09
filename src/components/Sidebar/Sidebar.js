import { connect } from 'react-redux';
import styles from '@components/styles/Sidebar.module.css';
import dynamic from 'next/dynamic';
import { faUser, faSearch, faBell, faEnvelope, faHome, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

const TwitterIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});
const HomeIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});
const SearchIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});
const BellIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});
const EnvelopeIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});
const BookmarkIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});
const UserIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});

const Sidebar = () => {
	return (
		<section className={styles.sidebar}>
			<TwitterIcon icon={faTwitter} size='2x' />
			<HomeIcon icon={faHome} size='lg' />
			<SearchIcon icon={faSearch} size='lg' />
			<BellIcon icon={faBell} size='lg' />
			<EnvelopeIcon icon={faEnvelope} size='lg' />
			<UserIcon icon={faUser} size='lg' />
			<BookmarkIcon icon={faBookmark} size='lg' />
		</section>
	);
};

function mapStateToProps(state) {
	return {
		// TODO
	};
}

export default connect(mapStateToProps)(Sidebar);
