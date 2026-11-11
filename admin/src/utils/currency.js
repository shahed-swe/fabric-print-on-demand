// Prices are entered, stored and charged (Stripe) in USD. They are only *displayed* in BDT.
// The rate comes from the backend (GET /api/exchange-rate), which refreshes it daily.
// App.js calls loadExchangeRate() on startup and re-renders once it arrives.

const FALLBACK_RATE = Number(process.env.REACT_APP_USD_TO_BDT) || 123;

let rate = FALLBACK_RATE;

export const getRate = () => rate;

export const setRate = (r) => {
  if (typeof r === 'number' && isFinite(r) && r > 50 && r < 500) rate = r;
  return rate;
};

export const toBDT = (usd) => Math.round((Number(usd) || 0) * rate);

export const formatBDT = (usd) => `৳${toBDT(usd).toLocaleString('en-IN')}`;

export async function loadExchangeRate(onChange) {
  try {
    const base = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    const res = await fetch(`${base}/exchange-rate`);
    const data = await res.json();
    if (data && data.rate !== rate) onChange(setRate(data.rate));
  } catch {
    /* keep current rate */
  }
}
