const DEFAULT_CAUSE = 'Food Distribution';

function summarizeDonationRows(rows, causeFilter = DEFAULT_CAUSE) {
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

module.exports = { summarizeDonationRows };
