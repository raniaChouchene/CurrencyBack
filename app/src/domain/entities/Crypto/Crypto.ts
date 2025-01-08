import mongoose, { Document } from "mongoose";

export interface ICrypto extends Document {
  id: String;
  symbol: String;
  name: String;
  price: number;
  volume: number;
  marketCap: number;
  timestamp: Date;
}

const CryptoSchema = new mongoose.Schema({
  id: String,
  symbol: String,
  name: String,
  price: Number,
  volume: Number,
  marketCap: Number,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<ICrypto>("Crypto", CryptoSchema);
