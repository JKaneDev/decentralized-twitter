import styled from 'styled-components';

const Spinner = () => {
	return <StyledSpinner className='spinner'></StyledSpinner>;
};

export default Spinner;

const StyledSpinner = styled.div`
	.spinner {
		border: 6px solid #f3f3f3;
		border-top: 6px solid #3498db;
		border-radius: 50%;
		width: 60px;
		height: 60px;
		animation: spin 2s linear infinite;
		margin: auto;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`;
