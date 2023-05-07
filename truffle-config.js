const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const { PROJECT_ID, PRIVATE_KEY } = process.env;
const mumbaiRpcUrl = `https://polygon-mumbai.infura.io/v3/${PROJECT_ID}`;
const sepoliaRpcUrl = `https://sepolia.infura.io/v3/${PROJECT_ID}`;

module.exports = {
	networks: {
		development: {
			host: '127.0.0.1',
			port: 7545,
			network_id: 5777,
		},
		mumbai: {
			provider: () => new HDWalletProvider(PRIVATE_KEY, mumbaiRpcUrl),
			network_id: 80001,
			confirmations: 2,
			gas: 6000000,
			gasPrice: 20000000000,
			timeoutBlocks: 200,
			skipDryRun: true,
		},
		sepolia: {
			provider: () => new HDWalletProvider(PRIVATE_KEY, sepoliaRpcUrl),
			gas: 6000000,
			network_id: 11155111,
			gasPrice: 20000000000,
		},
	},

	contracts_directory: './src/contracts/',
	contracts_build_directory: './src/abis/',

	mocha: {
		enableTimeouts: false,
	},

	contractSizer: {
		alphaSort: true,
		runOnCompile: true,
		disambiguatePaths: false,
	},

	// Configure your compilers
	compilers: {
		solc: {
			version: '0.8.19',
			settings: {
				optimizer: {
					enabled: true,
					runs: 200,
				},
			},
		},
	},
};
