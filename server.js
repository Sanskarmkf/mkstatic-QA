const express = require('express');
const path = require('path');
const XLSX = require('xlsx');
const { summarizeDonationRows } = require('./lib/donation-summary');

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_CAUSE = 'Food Distribution';
const DONATION_WORKBOOK_PATH = process.env.DONATION_WORKBOOK_PATH
  ? path.resolve(process.env.DONATION_WORKBOOK_PATH)
  : path.join(__dirname, 'assets', 'SanskarDonation_Data_1.xlsx');

app.get('/assets/SanskarDonation_Data_1.xlsx', (req, res) => {
  res.sendStatus(404);
});

app.use(express.static(__dirname));

function getDonationSummary(causeFilter = DEFAULT_CAUSE) {
  const workbook = XLSX.readFile(DONATION_WORKBOOK_PATH);
  const donationSheet = workbook.Sheets.Donation;
  if (!donationSheet) {
    throw new Error('Donation worksheet was not found in the workbook');
  }

  const rows = XLSX.utils.sheet_to_json(donationSheet, { header: 1, range: 1, defval: '' });
  return summarizeDonationRows(rows, causeFilter);
}

app.get('/api/donation-summary', async (req, res) => {
  try {
    const cause = req.query.cause || DEFAULT_CAUSE;
    const summary = await getDonationSummary(cause);
    res.json(summary);
  } catch (error) {
    console.error('Failed to read donation workbook:', error);
    res.status(500).json({ error: 'Unable to read donation data' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Donation data server is running at http://localhost:${PORT}`);
});
