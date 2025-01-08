import { Router, Request, Response } from "express";
import {
  displayHistoricalCryptoData,
  forecastCryptoPrices,
  saveCryptoDataToDB,
} from "~/application/controllers/CryptoController";
import Crypto from "~/domain/entities/Crypto/Crypto";
import CurrencyRepository from "../repositories/CurrencyRepository";

const router = Router();

/**
 * @swagger
 * /example:
 *   get:
 *     summary: Get all cryptocurrencies
 */
router.get("/save", async (req, res) => {
  try {
    await saveCryptoDataToDB();
    res.status(200).send("Crypto data saved successfully.");
  } catch (error) {
    res.status(500).send("Error saving crypto data.");
  }
});
/**
 * @swagger
 *  /cryptocurrencies:
 *   get:
 *     summary: Get all cryptocurrencies
 */
router.get("/", async (req, res) => {
  try {
    const currencyRepository = new CurrencyRepository();
    const data = await currencyRepository.getAllCryptoData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("Error fetching crypto data.");
  }
});
/**
 * @swagger
 * /example:
 *   get:
 *     summary: Get all cryptocurrencies
 *     description: Retrieve a list of all cryptocurrencies.
 */

router.get("/prices/:cryptoId", async (req: Request, res: Response) => {
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
/**
 * @swagger
 * /cryptocurrencies/most-recent:
 *   get:
 *     summary: Get the most recent crypto data
 */
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
/**
 * @swagger
 * /cryptocurrencies/crypto-prices:
 *   get:
 *     summary: Get the last 30 days of crypto prices
 */
router.get("/crypto-prices", async (req, res) => {
  const currencyRepository = new CurrencyRepository();
  const data = await currencyRepository.getLast30CryptoPrices();
  res.json(data);
});
/**
 * @swagger
 * /cryptocurrencies/historical-data:
 *   get:
 *     summary: Get historical data for a specific crypto
 */
router.get("/historical-data", async (req: Request, res: Response) => {
  const { currencyName, period } = req.query;

  if (!currencyName || !period) {
    return res
      .status(400)
      .json({ error: "currencyName and period are required." });
  }

  const data = await displayHistoricalCryptoData(
    currencyName as string,
    period as string
  );
  console.log("Period:", period);
  console.log("Historical data:", data);
  res.status(200).json(data);
});
/**
 * @swagger
 * /cryptocurrencies/forecast:
 *   post:
 *     summary: Get forecasted crypto prices
 */
router.post("/forecast", async (req: Request, res: Response) => {
  const { currencyName } = req.body;

  const method = "sma";
  const period = 7;

  const forecastResult = await forecastCryptoPrices(
    currencyName,
    method,
    period
  );

  const forecastedValues = forecastResult.forecastedValues.map((entry) => ({
    date: entry.date,
    price: entry.price,
  }));

  res.json({
    forecastedValues,
  });

  console.log("Forecast result:", { forecastedValues });
});

export { router as currencyRouter };
