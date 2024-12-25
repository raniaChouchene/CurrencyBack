import { Router } from "express";

import {
  displayHistoricalCryptoData,
  saveCryptoDataToDB,
} from "~/application/controllers/CryptoController";
import Crypto from "~/domain/entities/Crypto/Crypto";
import { CurrencyRepository } from "../repositories/CurrencyRepository";

const router = Router();
router.get("/test", (req, res) => {
  res.status(200).send("Test route is working!");
});

router.get("/save", async (req, res) => {
  try {
    await saveCryptoDataToDB();
    res.status(200).send("Crypto data saved successfully.");
  } catch (error) {
    res.status(500).send("Error saving crypto data.");
  }
});

router.get("/", async (req, res) => {
  try {
    const currencyRepository = new CurrencyRepository();
    const data = await currencyRepository.getAllCryptoData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("Error fetching crypto data.");
  }
});
router.get("/prices/:cryptoId", async (req, res) => {
  const { cryptoId } = req.params;

  try {
    const prices = await Crypto.find({ id: cryptoId })
      .sort({ timestamp: 1 })
      .select("timestamp price -_id");

    res.status(200).json(prices);
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    res.status(500).json({ error: "Unable to fetch prices" });
  }
});
router.get("/most-recent", async (req, res) => {
  try {
    const currencyRepository = new CurrencyRepository();
    const mostRecentData = await currencyRepository.getMostRecentPrices();
    res.status(200).json(mostRecentData);
  } catch (error) {
    console.error("Error fetching most recent crypto data:", error);
    res.status(500).json({ error: "Unable to fetch most recent crypto data." });
  }
});
router.get("/crypto-prices", async (req, res) => {
  try {
    const currencyRepository = new CurrencyRepository();
    const data = await currencyRepository.getLast30CryptoPrices();
    res.json(data);
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    res.status(500).json({ message: "Error fetching crypto prices" });
  }
});
router.get("/historical-data", async (req, res) => {
  const { currencyName, period } = req.query;

  if (!currencyName || !period) {
    return res
      .status(400)
      .json({ error: "currencyName and period are required." });
  }

  try {
    const data = await displayHistoricalCryptoData(
      currencyName as string,
      period as string
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error displaying historical crypto data:", error);
    res.status(500).send("Error displaying historical crypto data.");
  }
});

export { router as currencyRouter };
