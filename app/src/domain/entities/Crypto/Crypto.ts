import mongoose from "mongoose";

const CryptoSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  volume: Number,
  marketCap: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Crypto", CryptoSchema);
