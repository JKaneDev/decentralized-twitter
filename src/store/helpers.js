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
export const adjustTimeForTimezone = (endTime) => {
	const userDate = new Date();
	const offsetInMinutes = userDate.getTimezoneOffset();
	const offsetInHours = -(offsetInMinutes / 60);
	const AESTOffset = 10;
	const hoursDifference = AESTOffset - offsetInHours;
	const millisecondsDifference = hoursDifference * 3600 * 1000;
	const oneHourInMilliseconds = 3600 * 1000;
	const endTimeAdjusted = endTime - millisecondsDifference + oneHourInMilliseconds;

	return endTimeAdjusted;
};
