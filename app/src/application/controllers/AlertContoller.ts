import Crypto from "~/domain/entities/Crypto/Crypto";
import Alert from "~/domain/entities/Crypto/Alert";
import cron from "node-cron";

const jwt = require("jsonwebtoken");
import nodemailer from "nodemailer";
import { getCryptoByName, getMostRecentCryptoPrices } from "./CryptoController";
import { UserController } from "./UserController";
export const handleSetAlert = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.id;
    console.log("Decoded user ID:", userId);

    const { cryptoId, threshold, thresholdType } = req.body;
    console.log("Request Body:", { cryptoId, threshold, thresholdType });

    if (!cryptoId) {
      return res.status(400).json({ message: "Crypto ID is required" });
    }

    console.log("Searching for crypto with name:", cryptoId);
    const crypto = await Crypto.findOne({
      //@ts-expect-error
      name: new RegExp(`^${cryptoId}$`, "i"),
    });

    if (!crypto) {
      console.log(`No cryptocurrency found with name: ${cryptoId}`);
      return res.status(404).json({ message: "Cryptocurrency not found" });
    }

    console.log("Found cryptocurrency:", crypto);

    const alert = new Alert({
      userId,
      cryptoId: crypto._id,
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
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rania.chouchene.2019@gmail.com",
    pass: "qdta cqdq jtpv locs",
  },
});

export const sendEmailNotification = async (
  email,
  cryptoName,
  threshold,
  thresholdType,
  currentValue
) => {
  const subject = `Crypto Alert: ${cryptoName}`;
  const text = `The cryptocurrency "${cryptoName}" has ${
    thresholdType === "above" ? "exceeded" : "fallen below"
  } your threshold of ${threshold}. Current value: ${currentValue}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const monitorAlerts = async () => {
  try {
    const alerts = await Alert.find().populate("cryptoId");

    for (const alert of alerts) {
      const crypto = alert.cryptoId;
      const currentValue = await getCryptoByName(crypto.name);

      if (
        (alert.thresholdType === "above" &&
          currentValue.price > alert.threshold) ||
        (alert.thresholdType === "below" &&
          currentValue.price < alert.threshold)
      ) {
        const userEmail = await UserController.getUserByEmail(alert.userId);
        console.log(`Alert triggered for ${userEmail}`);
        await sendEmailNotification(
          userEmail,
          crypto.name,
          alert.threshold,
          alert.thresholdType,
          currentValue
        );
      }
    }
  } catch (error) {
    console.error("Error monitoring alerts:", error);
  }
};

/*cron.schedule("* * * * *", async () => {
  console.log("Running scheduled monitorAlerts...");
  await monitorAlerts();
});*/

module.exports = { handleSetAlert, fetchAlertHistory, monitorAlerts };
