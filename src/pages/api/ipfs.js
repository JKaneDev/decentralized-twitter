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
	try {
		if (req.method === 'POST') {
			const { tweetImage, metadata } = req.body;

			const htmlContent = `
  				<!DOCTYPE html>
  				<html lang="en">
  				<head>
  				  <meta charset="UTF-8">
  				  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  				  <style>
  				    body, img {
  				      margin: 0;
  				      padding: 0;
  				      border: none;
  				    }
  				    body {
  				      display: flex;
  				      align-items: center;
  				      justify-content: center;
  				      height: 100vh;
  				      width: 100vw;
  				      overflow: hidden;
  				    }
  				    img {
  				      width: 100%;
  				      height: 100%;
  				    }
  				  </style>
  				  <title>Image</title>
  				</head>
  				<body>
  				  <img src="${metadata.imageBase64}" alt="Image" />
  				</body>
  				</html>
			`;

			// Upload the snapshot to ipfs
			const imageResponse = await ipfs.add(tweetImage);

			// Return generated ipfs uri
			const ipfsURI = `https://ipfs.io/ipfs/${imageResponse.path}`;

			// Upload the HTML content to IPFS
			const htmlBuffer = Buffer.from(htmlContent, 'utf-8');
			const htmlResponse = await ipfs.add(htmlBuffer);
			const htmlURI = `https://ipfs.io/ipfs/${htmlResponse.path}`;

			// Upload the metadata JSON to IPFS:
			const metadataBuffer = Buffer.from([JSON.stringify(metadata)], 'utf-8');
			const metadataResponse = await ipfs.add(metadataBuffer);
			const metadataURI = `https://ipfs.io/ipfs/${metadataResponse.path}`;

			res.status(200).json({ imageURI: ipfsURI, metadataURI, htmlURI });
		} else {
			res.status(405).json({ success: false, message: 'Method not allowed' });
		}
	} catch (error) {
		console.error('Error processing IPFS request:', error);
		res.status(500).json({ success: false, message: 'Internal Server Error' });
	}
}
