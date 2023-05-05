import { tipUser } from '@components/store/interactions';
import { tweetTokenSelector } from '@components/store/selectors';
import { Log } from 'ethers';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import styled from 'styled-components';

const Tipper = ({ id, setShowTipper, setTipped, amount, setAmount, account, twitter, tweetToken, onClose }) => {
	const dispatch = useDispatch();

	const closeTipper = () => {
		if (onClose) {
			onClose();
		}
	};

	return (
		<StyledTipper
			onSubmit={(e) => {
				e.preventDefault();
				tipUser(tweetToken, twitter, account, dispatch, id, amount);
				setTipped(true);
				setShowTipper(false);
			}}
		>
			<input type='text' onChange={(e) => setAmount(e.target.value)} />
			<div className='button-wrapper'>
				<button className='close' onClick={closeTipper}>
					Close
				</button>
				<button className='tip' type='submit'>
					Tip
				</button>
			</div>
		</StyledTipper>
	);
};

function mapStateToProps(state) {
	return {
		tweetToken: tweetTokenSelector(state),
	};
}

const StyledTipper = styled.form`
	position: absolute;
	right: 60px;
	bottom: 0px;
	background-color: black;
	border: 1px solid #363636;
	width: 120px;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 0.5rem;
	border-radius: 4px;
	transition: 0.35s all ease-in-out;

	input {
		padding: 0.25rem 0.5rem;
		width: 100%;
		outline: none;
	}

	input:focus,
	input:active {
		border: 2px solid #1da1f2;
		border-radius: 4px;
	}

	.button-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	button {
		padding: 0.25rem 0.5rem;
		width: 50px;
		transition: 0.35s all ease-in-out;
		z-index: 1000;
	}

	button:hover {
		cursor: pointer;
	}

	.close,
	.input {
		border: none;
		border-radius: 4px;
	}

	.tip {
		border: none;
		border-radius: 4px;
		background-color: #1da1f2;
	}
`;

export default connect(mapStateToProps)(Tipper);
