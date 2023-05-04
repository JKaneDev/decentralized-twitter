export const MATIC_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DECIMALS = 10 ** 18;

export const ether = (wei) => {
	if (wei) {
		return wei / DECIMALS;
	}
};

export const tokens = ether;

export const formatBalance = (balance) => {
	balance = ether(balance);
	balance = Math.round(balance * 100) / 100;
	return balance;
};
