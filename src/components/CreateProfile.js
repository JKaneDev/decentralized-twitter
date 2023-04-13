import { createAccount } from '@components/store/interactions';
import { useState } from 'react';
import { connect } from 'react-redux';
import styles from '@components/styles/CreateProfile.module.css';
import dynamic from 'next/dynamic';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

const TwitterIcon = dynamic(() => import('@fortawesome/react-fontawesome').then((module) => module.FontAwesomeIcon), {
	ssr: false,
});

const defaultProfilePics = [
	'https://ipfs.io/ipfs/QmWCPhA68K9gHkJ7FeRqTTfvtUCuaS8Vd4DtytQQtwMWRH',
	'https://ipfs.io/ipfs/QmWsGaUohz9nSrVXtw6SgC8oFza5Bi3ATxjU5Z3Qm4Xwzh',
	'https://ipfs.io/ipfs/QmUxTrFbrgkZpsz8VYrcZJiNKWff1k8ymCS6kdmuGXjgou',
	'https://ipfs.io/ipfs/QmXb56dCEZai14bkmtyLdcm516v3RtTwNPepEyNshNWeDP',
	'https://ipfs.io/ipfs/QmVLgsmwweTVpGhS4TZ4X6auk9NFjv9tv826iCooUTADtC',
];

const CreateProfile = ({ dispatch, account, twitterContract, setAccountCreated }) => {
	const [name, setName] = useState('');
	const [bio, setBio] = useState('');
	const [profilePictureUrl, setProfilePictureUrl] = useState('');

	const onSubmit = async (e) => {
		e.preventDefault();
		await createAccount(twitterContract, name, bio, profilePictureUrl, account, dispatch);
		setAccountCreated(true);
	};

	const getRandomProfilePicture = () => {
		const randomIndex = Math.floor(Math.random() * defaultProfilePics.length);
		return defaultProfilePics[randomIndex];
	};

	return (
		<div className={styles.createProfile}>
			<TwitterIcon icon={faTwitter} size='3x' className={styles.twitterIcon} />
			<form onSubmit={onSubmit} className={styles.createProfileForm}>
				<h1 className={styles.h1}>Create your account</h1>
				<input
					type='text'
					className={styles.inputFields}
					placeholder="What's your name?"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
				<br />
				<textarea
					type='text'
					className={styles.textarea}
					placeholder='Tell us a little bit about yourself'
					value={bio}
					onChange={(e) => setBio(e.target.value)}
				/>
				<br />
				<input
					type='text'
					className={styles.inputFields}
					placeholder='IPFS Profile Picture URL'
					value={profilePictureUrl}
					onChange={(e) => setProfilePictureUrl(e.target.value)}
				/>
				<button
					type='button'
					className={styles.getRandomProfilePicture}
					onClick={() => setProfilePictureUrl(getRandomProfilePicture())}
				>
					Random
				</button>

				<br />
				<button type='submit' className={styles.btn}>
					Create
				</button>
			</form>
		</div>
	);
};

function mapStateToProps(state) {
	// console.log('Users: ', state.users);
	return {
		web3: state.web3.connection,
		account: state.web3.account,
		twitterContract: state.twitter.twitterContract,
	};
}

export default connect(mapStateToProps)(CreateProfile);
