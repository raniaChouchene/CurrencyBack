const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  cryptoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crypto",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  thresholdType: {
    type: String,
    enum: ["below", "above"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", alertSchema);
