const jwt = require("jsonwebtoken");

const Crypto = require("../models/Crypto");
export const handleSetAlert = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { cryptoId, threshold, thresholdType } = req.body;

    const crypto = await Crypto.findById(cryptoId);
    if (!crypto) {
      return res.status(404).json({ message: "Cryptocurrency not found" });
    }

    const alert = new Alert({
      userId,
      cryptoId,
      threshold,
      thresholdType,
    });

    await alert.save();

    return res.status(201).json({ message: "Alert set successfully!" });
  } catch (error) {
    console.error("Error setting alert:", error);
    return res.status(500).json({ message: "Failed to set alert" });
  }
};

export const fetchAlertHistory = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const alerts = await Alert.find({ userId }).populate("cryptoId");

    return res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching alert history:", error);
    return res.status(500).json({ message: "Failed to fetch alert history" });
  }
};

module.exports = { handleSetAlert, fetchAlertHistory };
