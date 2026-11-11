const ExchangeRate = require('../models/ExchangeRate');

// Used until the first successful fetch (or if every API is down on first boot).
const DEFAULT_RATE = Number(process.env.USD_TO_BDT) || 123;
const REFRESH_EVERY_MS = 24 * 60 * 60 * 1000; // once a day
const CHECK_EVERY_MS = 60 * 60 * 1000;        // check hourly whether a refresh is due

// Free, no-key APIs. Tried in order; the second is a fallback.
const SOURCES = [
  {
    name: 'open.er-api.com',
    url: 'https://open.er-api.com/v6/latest/USD',
    pick: (d) => d && d.result === 'success' && d.rates && d.rates.BDT,
  },
  {
    name: 'fawazahmed0/currency-api',
    url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    pick: (d) => d && d.usd && d.usd.bdt,
  },
];

// In-memory copy so formatting (e.g. order emails) never waits on the DB.
let cached = { rate: DEFAULT_RATE, source: 'default', fetchedAt: null, manualRate: null };

const effectiveRate = () => cached.manualRate || cached.rate;

const isSane = (r) => typeof r === 'number' && isFinite(r) && r > 50 && r < 500;

async function fetchFromApis() {
  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rate = Number(src.pick(await res.json()));
      if (!isSane(rate)) throw new Error(`implausible rate ${rate}`);
      return { rate, source: src.name };
    } catch (err) {
      console.error(`[exchange-rate] ${src.name} failed: ${err.message}`);
    }
  }
  return null;
}

// Fetch a fresh rate and save it. On failure, the last saved rate is kept.
async function refreshRate() {
  const result = await fetchFromApis();
  if (!result) return getRateInfo();
  const doc = await ExchangeRate.findOneAndUpdate(
    { pair: 'USD_BDT' },
    { rate: result.rate, source: result.source, fetchedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  cached = { rate: doc.rate, source: doc.source, fetchedAt: doc.fetchedAt, manualRate: doc.manualRate };
  console.log(`[exchange-rate] 1 USD = ${doc.rate} BDT (${doc.source})`);
  return getRateInfo();
}

async function loadFromDb() {
  const doc = await ExchangeRate.findOne({ pair: 'USD_BDT' });
  if (doc) cached = { rate: doc.rate, source: doc.source, fetchedAt: doc.fetchedAt, manualRate: doc.manualRate };
  return doc;
}

async function refreshIfStale() {
  try {
    await loadFromDb();
    const age = cached.fetchedAt ? Date.now() - new Date(cached.fetchedAt).getTime() : Infinity;
    if (age >= REFRESH_EVERY_MS) await refreshRate();
  } catch (err) {
    console.error('[exchange-rate] refresh check failed:', err.message);
  }
}

// Call once after MongoDB connects.
function startExchangeRateScheduler() {
  refreshIfStale();
  setInterval(refreshIfStale, CHECK_EVERY_MS).unref();
}

async function setManualRate(manualRate) {
  const value = manualRate === null || manualRate === '' || manualRate === undefined ? null : Number(manualRate);
  if (value !== null && !isSane(value)) throw new Error('Rate must be a number between 50 and 500');
  const doc = await ExchangeRate.findOneAndUpdate(
    { pair: 'USD_BDT' },
    { manualRate: value, $setOnInsert: { rate: cached.rate, source: cached.source } },
    { upsert: true, new: true }
  );
  cached.manualRate = doc.manualRate;
  return getRateInfo();
}

function getRateInfo() {
  return {
    rate: effectiveRate(),
    apiRate: cached.rate,
    manualRate: cached.manualRate,
    isManual: !!cached.manualRate,
    source: cached.source,
    fetchedAt: cached.fetchedAt,
  };
}

// USD amount -> formatted taka string, e.g. 44 -> "৳5,483"
function formatBDT(usd) {
  return `৳${Math.round((Number(usd) || 0) * effectiveRate()).toLocaleString('en-IN')}`;
}

module.exports = {
  startExchangeRateScheduler,
  refreshRate,
  setManualRate,
  getRateInfo,
  formatBDT,
};
