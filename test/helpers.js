const utils = require('web3').utils;

const ether = (n) => {
	return new utils.BN(utils.toWei(n.toString(), 'ether'));
};

const tokens = (n) => ether(n);

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000';

const EVM_REVERT = 'VM Exception while processing transaction: revert';

const wait = (seconds) => {
	const milliseconds = seconds * 1000;
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports = {
	ether,
	tokens,
	ETHER_ADDRESS,
	EVM_REVERT,
	wait,
};
