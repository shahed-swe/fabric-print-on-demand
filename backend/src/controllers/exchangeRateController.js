const { getRateInfo, refreshRate, setManualRate } = require('../services/exchangeRateService');

// GET /api/exchange-rate (public)
exports.getExchangeRate = (req, res) => {
  res.json(getRateInfo());
};

// POST /api/admin/exchange-rate/refresh
exports.refreshExchangeRate = async (req, res) => {
  try {
    res.json(await refreshRate());
  } catch (err) {
    res.status(500).json({ message: 'Failed to refresh exchange rate', error: err.message });
  }
};

// PUT /api/admin/exchange-rate  body: { manualRate: number | null }
exports.updateExchangeRate = async (req, res) => {
  try {
    res.json(await setManualRate(req.body.manualRate));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
