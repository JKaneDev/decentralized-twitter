import { create } from 'ipfs-http-client';

// IPFS credentials
const projectId = process.env.API_KEY;
const projectSecret = process.env.SECRET_API_KEY;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Create the IPFS instance
const ipfs = create({
	url: `https://ipfs.infura.io:5001/api/v0`,
	protocol: 'https',
	headers: {
		Authorization: auth,
	},
});

export default async function handleIpfsRequest(req, res) {
	if (req.method === 'POST') {
		const { dataUrl, metadata } = req.body;

		// Upload the snapshot to ipfs
		const imageResponse = await ipfs.add(dataUrl);

		// Return generated ipfs uri
		const ipfsURI = `https://ipfs.io/ipfs/${imageResponse.path}`;

		// Upload the metadata JSON to IPFS:
		const metadataBuffer = Buffer.from([JSON.stringify(metadata)], 'utf-8');
		const metadataResponse = await ipfs.add(metadataBuffer);
		const metadataURI = `https://ipfs.io/ipfs/${metadataResponse.path}`;

		res.status(200).json({ imageURI: ipfsURI, metadataURI });
	} else {
		res.status(405).json({ success: false, message: 'Method not allowed' });
	}
}
