import pinataSDK from '@pinata/sdk';

// Pinata credentials
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

export default async function handler(req, res) {
	if (req.method === 'POST') {
		try {
			const ipfsHash = req.body.hash;
			console.log('IPFS Hash: ', ipfsHash);
			const pinataResponse = await pinata.pinByHash(ipfsHash);
			console.log('Pinata Response: ', pinataResponse);
			res.status(200).json({ success: true, data: pinataResponse });
		} catch (error) {
			console.log('Pinata Error: ', error);
			res.status(500).json({ success: false, message: error.message });
		}
	} else {
		res.status(405).json({ success: false, message: 'Method not allowed' });
	}
}
