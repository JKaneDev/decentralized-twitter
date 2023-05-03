import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
import styles from '@components/styles/Sidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSearch, faBell, faEnvelope, faHome, faBookmark, faCoins } from '@fortawesome/free-solid-svg-icons';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import Router from 'next/router';

const Sidebar = () => {
	const handleNavigation = () => {
		Router.push('/auction');
	};

	const [showText, setShowText] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 1100) {
				setShowText(true);
			} else {
				setShowText(false);
			}
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		// Clean up event listener on component unmount
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<section className={styles.sidebar}>
			<div className={styles.iconWrapper} id={styles.twitterIcon}>
				<FontAwesomeIcon icon={faTwitter} size='2x' />
			</div>
			<div className={styles.iconWrapper}>
				<FontAwesomeIcon icon={faHome} size='lg' />
				{showText && <span className={styles.linkText}>Home</span>}
			</div>
			<div className={styles.iconWrapper}>
				<FontAwesomeIcon icon={faSearch} size='lg' />
				{showText && <span className={styles.linkText}>Search</span>}
			</div>
			<div className={styles.iconWrapper}>
				<FontAwesomeIcon icon={faBell} size='lg' />
				{showText && <span className={styles.linkText}>Notifications</span>}
			</div>
			<div className={styles.iconWrapper}>
				<FontAwesomeIcon icon={faEnvelope} size='lg' />
				{showText && <span className={styles.linkText}>Messages</span>}
			</div>
			<div className={styles.iconWrapper}>
				<FontAwesomeIcon icon={faUser} size='lg' />
				{showText && <span className={styles.linkText}>Profile</span>}
			</div>
			<div className={styles.iconWrapper}>
				<FontAwesomeIcon icon={faBookmark} size='lg' />
				{showText && <span className={styles.linkText}>Bookmarks</span>}
			</div>
			<div className={styles.iconWrapper} onClick={handleNavigation}>
				<FontAwesomeIcon icon={faCoins} size='lg' />
				{showText && <span className={styles.linkText}>Auction</span>}
			</div>
		</section>
	);
};

function mapStateToProps(state) {
	return {
		// TODO
	};
}

export default connect(mapStateToProps)(Sidebar);
