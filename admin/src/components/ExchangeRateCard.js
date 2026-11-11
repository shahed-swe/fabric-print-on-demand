import React, { useEffect, useState } from 'react';
import axios from '../config/axios';
import { setRate } from '../utils/currency';

// Shows the USD -> BDT display rate (auto-refreshed daily by the backend)
// and lets an admin refresh it now or pin a manual rate.
export default function ExchangeRateCard({ onRateChange }) {
  const [info, setInfo] = useState(null);
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const apply = (data) => {
    setInfo(data);
    setManual(data.manualRate ? String(data.manualRate) : '');
    setRate(data.rate);
    if (onRateChange) onRateChange(data.rate);
  };

  useEffect(() => {
    axios.get('/admin/exchange-rate').then((r) => apply(r.data)).catch(() => setError('Could not load exchange rate'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (request) => {
    setBusy(true);
    setError('');
    try {
      apply((await request()).data);
    } catch (e) {
      setError(e.response?.data?.message || 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  const refresh = () => run(() => axios.post('/admin/exchange-rate/refresh'));
  const saveManual = () => run(() => axios.put('/admin/exchange-rate', { manualRate: manual === '' ? null : Number(manual) }));
  const clearManual = () => run(() => axios.put('/admin/exchange-rate', { manualRate: null }));

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-600">Exchange rate (display only)</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            1 USD = ৳{info ? Number(info.rate).toFixed(2) : '…'}
            {info?.isManual && <span className="ml-2 align-middle text-xs font-medium text-amber-700 bg-amber-100 rounded px-2 py-0.5">Manual</span>}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {info?.fetchedAt
              ? `Auto rate ৳${Number(info.apiRate).toFixed(2)} from ${info.source}, updated ${new Date(info.fetchedAt).toLocaleString()}. Refreshes daily.`
              : 'Waiting for first automatic update.'}{' '}
            Prices are entered and charged in USD; customers see taka.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={refresh} disabled={busy} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
            Refresh now
          </button>
          <input
            type="number"
            step="0.01"
            placeholder="Manual rate"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md"
          />
          <button onClick={saveManual} disabled={busy || manual === ''} className="px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            Set manual
          </button>
          {info?.isManual && (
            <button onClick={clearManual} disabled={busy} className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
              Use auto rate
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
