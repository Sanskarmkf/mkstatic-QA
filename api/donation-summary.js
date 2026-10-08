const { google } = require('googleapis');
const { summarizeDonationRows } = require('../lib/donation-summary');

const DEFAULT_CAUSE = 'Food Distribution';
const SHEET_RANGE = 'Donation!A2:Z';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cause = req.query.cause || DEFAULT_CAUSE;
  if (typeof cause !== 'string' || cause.trim().length > 100) {
    return res.status(400).json({ error: 'Invalid donation cause' });
  }

  const requiredEnvironment = ['GOOGLE_SHEET_ID', 'GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY'];
  const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);
  if (missingEnvironment.length > 0) {
    console.error(`Donation summary configuration is missing: ${missingEnvironment.join(', ')}`);
    return res.status(503).json({ error: 'Donation summary is not configured' });
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: SHEET_RANGE,
    });

    return res.status(200).json(
      summarizeDonationRows(response.data.values || [], cause)
    );
  } catch (error) {
    console.error('Failed to fetch donation summary from Google Sheets:', error.message);
    return res.status(500).json({ error: 'Unable to fetch donation summary' });
  }
};
