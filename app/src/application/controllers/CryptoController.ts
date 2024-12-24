import axios from "axios";
import { CurrencyRepository } from "~/infra/repositories/CurrencyRepository";
import cron from "node-cron";

export const getCryptoData = async () => {
  try {
    const response = await axios.get("https://api.coincap.io/v2/assets");
    return response.data.data.slice(0, 10);
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw error;
  }
};

export const saveCryptoDataToDB = async () => {
  try {
    const data = await getCryptoData();
    const timestampedData = data.map((crypto) => ({
      ...crypto,
      timestamp: new Date().toISOString(),
    }));
    const currencyRepository = new CurrencyRepository();
    await currencyRepository.saveCryptoData(timestampedData);
    console.log(
      "Crypto data saved successfully at",
      new Date().toLocaleString()
    );
  } catch (error) {
    console.error("Error saving crypto data to DB:", error);
    throw error;
  }
};
export const getMostRecentCryptoPrices = async () => {
  try {
    const currencyRepository = new CurrencyRepository();
    const recentPrices = await currencyRepository.getMostRecentPrices();
    return recentPrices;
  } catch (error) {
    console.error("Error fetching the most recent crypto prices:", error);
    throw error;
  }
};
export const displayHistoricalCryptoData = async (
  currencyName: string,
  period: string
) => {
  try {
    const currencyRepository = new CurrencyRepository();
    const allData = await currencyRepository.getAllCryptoData();

    if (period !== "month" && period !== "year") {
      throw new Error("Invalid period. Please specify 'month' or 'year'.");
    }

    let startDate = new Date();
    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const filteredData = allData.filter((crypto) => {
      const timestamp = new Date(crypto.timestamp);
      return crypto.name === currencyName && timestamp >= startDate;
    });

    // Return the filtered data
    return filteredData;
  } catch (error) {
    console.error("Error fetching historical crypto data:", error);
    throw error;
  }
};

cron.schedule("* * * * *", saveCryptoDataToDB);
