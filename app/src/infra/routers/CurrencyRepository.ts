import { Router } from "express";

import { CurrencyRepository } from "../repositories/CurrencyRepository";
import { saveCryptoDataToDB } from "~/application/controllers/CryptoController";

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

export { router as currencyRouter };
