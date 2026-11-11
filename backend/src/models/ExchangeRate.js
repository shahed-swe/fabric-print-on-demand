const mongoose = require('mongoose');

// Single document holding the USD -> BDT rate used to *display* prices in taka.
// Prices are stored and charged (Stripe) in USD; this rate is display-only.
const exchangeRateSchema = new mongoose.Schema(
  {
    pair: { type: String, default: 'USD_BDT', unique: true },
    rate: { type: Number, required: true },          // last rate fetched from the API
    source: { type: String },                        // which API supplied it
    fetchedAt: { type: Date },                       // when it was fetched
    manualRate: { type: Number, default: null },     // admin override; null = use API rate
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
