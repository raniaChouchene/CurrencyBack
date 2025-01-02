import Crypto from "~/domain/entities/Crypto/Crypto";
import Alert from "~/domain/entities/Crypto/Alert";

const jwt = require("jsonwebtoken");

export const handleSetAlert = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.id;
    console.log("Decoded user ID:", userId);

    const { cryptoId, threshold, thresholdType } = req.body;
    console.log("Request Body:", { cryptoId, threshold, thresholdType });

    // Validate if cryptoId is provided
    if (!cryptoId) {
      return res.status(400).json({ message: "Crypto ID is required" });
    }

    // Find the cryptocurrency by its name (since you're passing name like 'solana')
    const crypto = await Crypto.findOne({
      name: new RegExp(`^${cryptoId}$`, "i"),
    });
    if (!crypto) {
      console.log("Crypto not found with name:", cryptoId);
      return res.status(404).json({ message: "Cryptocurrency not found" });
    }

    // Create a new alert
    const alert = new Alert({
      userId,
      cryptoId: crypto._id, // Using the cryptoId after finding the cryptocurrency by name
      threshold,
      thresholdType,
    });

    await alert.save();

    console.log("Alert saved successfully");
    return res.status(201).json({ message: "Alert set successfully!" });
  } catch (error) {
    console.error("Error setting alert:", error);
    return res.status(500).json({ message: "Failed to set alert" });
  }
};

export const fetchAlertHistory = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.id;
    const alerts = await Alert.find({ userId }).populate("cryptoId");

    return res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching alert history:", error);
    return res.status(500).json({ message: "Failed to fetch alert history" });
  }
};

module.exports = { handleSetAlert, fetchAlertHistory };
