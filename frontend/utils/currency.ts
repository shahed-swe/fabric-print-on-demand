// Prices are stored and charged (Stripe) in USD. They are only *displayed* in BDT.
// The rate comes from the backend (GET /api/exchange-rate), which refreshes it daily.
// _app.tsx calls loadExchangeRate() on startup and re-renders once it arrives.

const FALLBACK_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT) || 123;
const CACHE_KEY = 'usdToBdtRate';

let rate = FALLBACK_RATE;

export const getRate = () => rate;

export const toBDT = (usd: number | string | null | undefined): number =>
  Math.round((Number(usd) || 0) * rate);

export const formatBDT = (usd: number | string | null | undefined): string =>
  `৳${toBDT(usd).toLocaleString('en-IN')}`;

const isSane = (r: unknown): r is number => typeof r === 'number' && isFinite(r) && r > 50 && r < 500;

// Applies the browser-cached rate immediately, then the live one; calls onChange when it changes.
export async function loadExchangeRate(onChange: (r: number) => void): Promise<void> {
  try {
    const cached = Number(window.localStorage.getItem(CACHE_KEY));
    if (isSane(cached) && cached !== rate) {
      rate = cached;
      onChange(rate);
    }
  } catch {
    /* storage unavailable */
  }
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const res = await fetch(`${base}/exchange-rate`);
    const data = await res.json();
    if (isSane(data?.rate) && data.rate !== rate) {
      rate = data.rate;
      onChange(rate);
    }
    try {
      window.localStorage.setItem(CACHE_KEY, String(rate));
    } catch {
      /* storage unavailable */
    }
  } catch {
    /* keep current rate */
  }
}
