## Decentralized Twitter

### Summary

This clone of Twitter is a decentralized application (dApp) built on the Polygon network. The app incorporates some of the main functionality of Twitter, but also allows users to mint, buy, and sell unique non-fungible tokens (NFTs) representing tweets. Users can create NFTs of their favorite tweets, sell them at auction or participate in auctions for minted Tweet NFTs created by other users. The platform utilizes four smart contracts to handle TweetToken/NFT creation & ownership, NFT auctions, and the common native functionality of the Twitter application as we know it.

### Obtaining Test MATIC

To interact with the app on the Polygon testnet, you will need some test MATIC tokens. You can obtain these tokens from the Polygon Faucet. Visit the Polygon Faucet and follow the instructions to receive test MATIC tokens in your wallet.

### Home Page

<embed your screenshot link here>

### Walkthrough

The main functionality of this dApp includes:

- #### Minting NFTs:

  - Users can create NFTs of tweets by providing the tweet's metadata, image, and HTML URIs. Each NFT is uniquely identified by its ID and associated with the original tweet author.

- #### Auctioning NFTs:

  - NFT owners can create auctions for their NFTs, setting a starting price and auction duration. Other users can then participate in the auction by placing bids on the NFT.

- #### Buying NFTs:

  - Users can bid on NFT auctions with the TWEET token. The highest bidder at the end of the auction will win the NFT and have it transferred to their wallet.

- #### Selling NFTs:

  - NFT owners can sell their NFTs in auctions, receiving a share of the final bid price after royalties and platform fees are deducted.

### Running the App Locally

To run the app on your local machine using Ganache and Truffle, follow these steps:

1. Install Ganache and Truffle if you haven't already.
2. Clone the repository and navigate to the project folder.
3. Run `npm install` to install dependencies.
4. Launch Ganache and create a new workspace with the Truffle configuration file (truffle-config.js) from the project folder.
5. Import at least three separate accounts from Ganache into MetaMask to fully explore the app's functionality. Make sure to switch MetaMask to the local Ganache network (default: http://127.0.0.1:7545).
6. Run `truffle migrate` to compile and deploy the smart contracts to the local network.
7. Run `npm run start` to start the local development server and open the app in your browser.

Now you should be able to interact with the dApp locally and test the functionality - buying and selling NFTs using the test accounts you imported into MetaMask. Please see my walkthrough video for a full demonstration of this dApp.
