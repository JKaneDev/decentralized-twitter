import styles from '@components/styles/TokenHub.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { buyTweetToken, loadBalances } from '@components/store/interactions';
import {
	accountSelector,
	balancesLoadingSelector,
	maticBalanceSelector,
	maticDepositAmountSelector,
	maticWithdrawAmountSelector,
	tokenDepositAmountSelector,
	tokenPurchaseSelector,
	tokenWithdrawAmountSelector,
	tweetTokenBalanceSelector,
	tweetTokenSelector,
	twitterMaticBalanceSelector,
	twitterSelector,
	twitterTokenBalanceSelector,
	web3Selector,
} from '@components/store/selectors';
import { tokenPurchaseAmountChanged, makingPurchase } from '@components/store/actions';

const TokenHub = ({
	dispatch,
	web3,
	account,
	twitter,
	tweetToken,
	maticBalance,
	tweetTokenBalance,
	setShowTokenHub,
	tokenPurchase,
	showPurchaseTotal,
}) => {
	const loadBlockchainData = async (dispatch, web3, account, twitter, tweetToken) => {
		await loadBalances(dispatch, web3, tweetToken, twitter, account);
	};

	// LOAD BALANCES ON RENDER
	useEffect(() => {
		loadBlockchainData(dispatch, web3, account, twitter, tweetToken);
	}, []);

	return (
		<div className={styles.container}>
			<div className={styles.back}>
				<button className={styles.backBtn} onClick={() => setShowTokenHub(false)}>
					<FontAwesomeIcon icon={faArrowLeft} size='sm' />
					Back
				</button>
			</div>

			<div className={styles.hubContainers}>
				<div className={styles.containerHeader}>Balances</div>
				<table className={styles.table}>
					<thead className={styles.tableHead}>
						<tr className={styles.tableRow}>
							<th className={styles.headerCells}>Token</th>
							<th className={styles.headerCells}>Balance</th>
						</tr>
					</thead>
					<tbody>
						<tr className={styles.tableRow}>
							<td className={styles.headerCells}>MATIC</td>
							<td className={styles.headerCells}>{maticBalance || 0}</td>
						</tr>
						<tr className={styles.tableRow}>
							<td className={styles.headerCells}>TWEET</td>
							<td className={styles.headerCells}>{tweetTokenBalance || 0}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className={styles.hubContainers} id={styles.purchaseContainer}>
				<div className={styles.containerHeader} id={styles.purchaseHeader}>
					Purchase TWEET
				</div>
				<form
					className={styles.form}
					onSubmit={(e) => {
						e.preventDefault();
						dispatch(makingPurchase());
						buyTweetToken(web3, dispatch, twitter, tokenPurchase.amount, account);
						dispatch(tokenPurchaseAmountChanged(''));
					}}
				>
					<div className={styles.inputWrapper}>
						<input
							type='text'
							placeholder='TWEET Quantity'
							className={styles.inputField}
							maxLength='4'
							onChange={(e) => {
								dispatch(tokenPurchaseAmountChanged(e.target.value));
							}}
							id='purchase-amount'
							required
						/>
						<button type='submit' className={styles.submitBtn}>
							Buy
						</button>
					</div>
					{showPurchaseTotal ? (
						<span className={styles.purchaseTotal}>Total: {tokenPurchase.amount} TWEET</span>
					) : (
						<span className={styles.purchaseTotal}>Total: 0 TWEET</span>
					)}
				</form>
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	const balancesLoading = balancesLoadingSelector(state);
	const tokenPurchase = tokenPurchaseSelector(state);

	return {
		web3: web3Selector(state),
		account: accountSelector(state),
		twitter: twitterSelector(state),
		tweetToken: tweetTokenSelector(state),
		maticBalance: maticBalanceSelector(state),
		tweetTokenBalance: tweetTokenBalanceSelector(state),
		twitterMaticBalance: twitterMaticBalanceSelector(state),
		twitterTokenBalance: twitterTokenBalanceSelector(state),
		balancesLoading,
		tokenPurchase,
		showPurchaseTotal: tokenPurchase.amount,
	};
}

export default connect(mapStateToProps)(TokenHub);