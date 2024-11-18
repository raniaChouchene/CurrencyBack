const mongoose = require("mongoose");

const CryptoSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  volume: Number,
  marketCap: Number,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Crypto", CryptoSchema);
