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
      timestamp: new Date().toISOString()
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
if (process.env.NODE_ENV !== "test") {
  cron.schedule("5 * * * *", saveCryptoDataToDB);
}
