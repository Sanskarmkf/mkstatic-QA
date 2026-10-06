const express = require('express');
const path = require('path');
const XLSX = require('xlsx');

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
  const normalizedCause = String(causeFilter || DEFAULT_CAUSE).trim().toLowerCase();
  let totalReceived = 0;
  let donationCount = 0;

  rows.forEach((row) => {
    if (!Array.isArray(row) || row.length < 6) {
      return;
    }

    const donationCause = String(row[5] || '').trim();
    if (!donationCause || donationCause.toLowerCase() !== normalizedCause) {
      return;
    }

    const amountValue = String(row[2] ?? '').trim();
    const cleanedAmount = amountValue.replace(/[^0-9.-]/g, '');
    if (!cleanedAmount || cleanedAmount === '-' || cleanedAmount === '.' || cleanedAmount === '-.') {
      return;
    }

    const amount = Number(cleanedAmount);
    if (!Number.isFinite(amount)) {
      return;
    }

    totalReceived += amount;
    donationCount += 1;
  });

  return {
    totalReceived,
    donationCount,
    causeFilter: normalizedCause,
  };
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
