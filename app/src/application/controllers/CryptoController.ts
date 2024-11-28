import axios from "axios";
import { CurrencyRepository } from "~/infra/repositories/CurrencyRepository";
import cron from "node-cron";

// Function to fetch cryptocurrency data from the API
export const getCryptoData = async () => {
  try {
    const response = await axios.get("https://api.coincap.io/v2/assets");
    return response.data.data.slice(0, 10); // Fetch the top 10 cryptocurrencies
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw error;
  }
};

// Function to save the fetched data into the database
export const saveCryptoDataToDB = async () => {
  try {
    const data = await getCryptoData();
    const timestampedData = data.map((crypto) => ({
      ...crypto,
      timestamp: new Date().toISOString(), // Add a timestamp for tracking
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
// Schedule the task to run every minute
cron.schedule("* * * * *", saveCryptoDataToDB);
