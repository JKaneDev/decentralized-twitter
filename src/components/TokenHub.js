import styles from '@components/styles/TokenHub.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
	buyTweetToken,
	depositMatic,
	depositTweetToken,
	loadBalances,
	withdrawMatic,
} from '@components/store/interactions';
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
import {
	maticDepositAmountChanged,
	maticWithdrawAmountChanged,
	tokenDepositAmountChanged,
	tokenWithdrawAmountChanged,
	tokenPurchaseAmountChanged,
	makingPurchase,
} from '@components/store/actions';

const TokenHub = ({
	dispatch,
	web3,
	account,
	twitter,
	tweetToken,
	showForm,
	maticBalance,
	twitterMaticBalance,
	tweetTokenBalance,
	twitterTokenBalance,
	maticDepositAmount,
	maticWithdrawAmount,
	tokenDepositAmount,
	tokenWithdrawAmount,
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
				<div className={styles.containerHeader}>Deposits</div>
				<table className={styles.table}>
					<thead className={styles.tableHead}>
						<tr className={styles.tableRow}>
							<th className={styles.headerCells}>Token</th>
							<th className={styles.headerCells}>Wallet</th>
							<th className={styles.headerCells}>Twitter</th>
						</tr>
					</thead>
					<tbody>
						<tr className={styles.tableRow}>
							<td className={styles.headerCells}>MATIC</td>
							<td className={styles.headerCells}>{maticBalance || 0}</td>
							<td className={styles.headerCells}>{twitterMaticBalance || 0}</td>
						</tr>
						<tr className={styles.tableRow}>
							<td className={styles.headerCells}>TWEET</td>
							<td className={styles.headerCells}>{tweetTokenBalance || 0}</td>
							<td className={styles.headerCells}>{twitterTokenBalance || 0}</td>
						</tr>
					</tbody>
				</table>
				<div className={styles.formWrapper}>
					<form
						className={styles.form}
						onSubmit={(e) => {
							e.preventDefault();
							depositMatic(dispatch, twitter, web3, maticDepositAmount, account);
						}}
					>
						<div className={styles.inputWrapper}>
							<input
								type='text'
								placeholder='MATIC Amount'
								className={styles.inputField}
								onChange={(e) => dispatch(maticDepositAmountChanged(e.target.value))}
								required
							/>
							<button type='submit' className={styles.submitBtn}>
								Deposit
							</button>
						</div>
					</form>
					<form
						className={styles.form}
						onSubmit={(e) => {
							e.preventDefault();

							depositTweetToken(dispatch, twitter, tweetToken, web3, tokenDepositAmount, account);
						}}
					>
						<div className={styles.inputWrapper}>
							<input
								type='text'
								placeholder='TWEET Amount'
								className={styles.inputField}
								onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value))}
								required
							/>
							<button type='submit' className={styles.submitBtn}>
								Deposit
							</button>
						</div>
					</form>
				</div>
			</div>
			<div className={styles.hubContainers}>
				<div className={styles.containerHeader}>Withdrawals</div>
				<table className={styles.table}>
					<thead className={styles.tableHead}>
						<tr className={styles.tableRow}>
							<th className={styles.headerCells}>Token</th>
							<th className={styles.headerCells}>Wallet</th>
							<th className={styles.headerCells}>Twitter</th>
						</tr>
					</thead>
					<tbody>
						<tr className={styles.tableRow}>
							<td className={styles.headerCells}>MATIC</td>
							<td className={styles.headerCells}>{maticBalance || 0}</td>
							<td className={styles.headerCells}>{twitterMaticBalance || 0}</td>
						</tr>
						<tr className={styles.tableRow}>
							<td className={styles.headerCells}>TWEET</td>
							<td className={styles.headerCells}>{tweetTokenBalance || 0}</td>
							<td className={styles.headerCells}>{twitterTokenBalance || 0}</td>
						</tr>
					</tbody>
				</table>
				<div className={styles.formWrapper}>
					<form
						className={styles.form}
						onSubmit={(e) => {
							e.preventDefault();
							withdrawMatic(dispatch, twitter, web3, maticWithdrawAmount, account);
						}}
					>
						<div className={styles.inputWrapper}>
							<input
								type='text'
								placeholder='MATIC Amount'
								className={styles.inputField}
								onChange={(e) => dispatch(maticWithdrawAmountChanged(e.target.value))}
								required
							/>
							<button type='submit' className={styles.submitBtn}>
								Withdraw
							</button>
						</div>
					</form>
					<form
						className={styles.form}
						onSubmit={(e) => {
							e.preventDefault();
							withdrawTweetToken(dispatch, twitter, tweetToken, web3, tokenWithdrawAmount, account);
						}}
					>
						<div className={styles.inputWrapper}>
							<input
								type='text'
								placeholder='TWEET Amount'
								className={styles.inputField}
								onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value))}
								required
							/>
							<button type='submit' className={styles.submitBtn}>
								Withdraw
							</button>
						</div>
					</form>
				</div>
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

	// console.log({
	// 	tweetTokenBalance: tweetTokenBalanceSelector(state),
	// });

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
		showForm: !tokenPurchase.making,
		maticDepositAmount: maticDepositAmountSelector(state),
		maticWithdrawAmount: maticWithdrawAmountSelector(state),
		tokenDepositAmount: tokenDepositAmountSelector(state),
		tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
		tokenPurchase,
		showPurchaseTotal: tokenPurchase.amount,
	};
}

export default connect(mapStateToProps)(TokenHub);
