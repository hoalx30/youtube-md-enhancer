const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');

// prettier-ignore
const scopes = ["https://www.googleapis.com/auth/youtube.readonly", "https://www.googleapis.com/auth/youtubepartner",  "https://www.googleapis.com/auth/youtube.force-ssl", "https://www.googleapis.com/auth/youtube"];
const credentialsPath = path.join(__dirname, '../credentials.json');

const authorize = async () => {
	if (fs.existsSync(credentialsPath)) {
		const credentials = JSON.parse(fs.readFileSync(credentialsPath, { encoding: 'utf-8' }));
		const auth = google.auth.fromJSON(credentials);
		// @ts-ignore
		google.options({ auth });
	} else {
		// @ts-ignore
		const auth = await authenticate({ keyfilePath: path.join(__dirname, '../oauth2.json'), scopes, access_type: 'offline', prompt: 'consent' });
		google.options({ auth });
		// prettier-ignore
		const credentials = { type: 'authorized_user', client_id: auth._clientId, client_secret: auth._clientSecret, refresh_token: auth.credentials.refresh_token, access_token: auth.credentials.access_token, expiry_date: auth.credentials.expiry_date};
		fs.writeFileSync(credentialsPath, JSON.stringify(credentials));
	}
	return google;
};

module.exports = { authorize };
