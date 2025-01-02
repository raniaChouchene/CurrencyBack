import axios from "axios";
import { CurrencyRepository } from "../../infra/repositories/CurrencyRepository";
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
export const getCryptoByName = async (cryptoName: string) => {
  try {
    if (!cryptoName) {
      throw new Error("Cryptocurrency name is required");
    }

    const currencyRepository = new CurrencyRepository();
    const cryptoData = await currencyRepository.getCryptoByName(cryptoName);

    if (!cryptoData) {
      throw new Error(`No data found for cryptocurrency: ${cryptoName}`);
    }

    return cryptoData;
  } catch (error) {
    console.error("Error fetching cryptocurrency by name:", error);
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

    if (period !== "month" && period !== "week") {
      throw new Error("Invalid period. Please specify 'month' or 'week'.");
    }

    const currentDate = new Date();
    const startDate = new Date();
    if (period === "month") {
      startDate.setMonth(currentDate.getMonth() - 1);
    } else if (period === "week") {
      startDate.setDate(currentDate.getDate() - 7);
    }

    const filteredData = allData.filter((crypto) => {
      const timestamp = new Date(crypto.timestamp);
      return crypto.name === currencyName && timestamp >= startDate;
    });

    const sortedData = filteredData.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    return sortedData.slice(0, 30);
  } catch (error) {
    console.error("Error fetching historical crypto data:", error);
    throw error;
  }
};

cron.schedule("* * * * *", saveCryptoDataToDB);
export const forecastCryptoPrices = async (
  currencyName: string,
  method: string,
  period: number
) => {
  try {
    const currencyRepository = new CurrencyRepository();
    const allData = await currencyRepository.getAllCryptoData();
    const cryptoData = allData.filter((crypto) => crypto.name === currencyName);

    if (cryptoData.length === 0) {
      throw new Error(`No data found for ${currencyName}`);
    }

    const sortedData = cryptoData.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA.getTime() - dateB.getTime();
    });

    const historicalPrices = sortedData.map((entry) => parseFloat(entry.price));
    const historicalTimestamps = sortedData.map((entry) => entry.timestamp);

    let forecastedValues: { date: string; price: number }[];
    if (method === "sma") {
      const forecastedPrices = simpleMovingAverage(historicalPrices, period);
      forecastedValues = generateForecastTimestamps(
        historicalTimestamps,
        forecastedPrices
      );
    } else if (method === "exponential") {
      const forecastedPrices = exponentialSmoothing(historicalPrices, 0.5);
      forecastedValues = generateForecastTimestamps(
        historicalTimestamps,
        forecastedPrices
      );
    } else {
      throw new Error("Invalid forecast method. Use 'sma' or 'exponential'.");
    }

    return {
      historicalData: sortedData.map((entry) => ({
        date: entry.timestamp,
        price: parseFloat(entry.price),
      })),
      forecastedValues,
    };
  } catch (error) {
    console.error("Error forecasting crypto prices:", error);
    throw error;
  }
};

function simpleMovingAverage(data: number[], windowSize: number) {
  const result: number[] = [];
  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    const avg = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(avg);
  }
  return result;
}

function exponentialSmoothing(data: number[], alpha: number) {
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

function generateForecastTimestamps(
  historicalTimestamps: string[],
  forecastedPrices: number[]
) {
  const lastTimestamp = new Date(
    historicalTimestamps[historicalTimestamps.length - 1]
  );

  const oneDay = 24 * 60 * 60 * 1000;

  return forecastedPrices.slice(0, 30).map((price, index) => {
    const newDate = new Date(lastTimestamp.getTime() + (index + 1) * oneDay);
    return {
      date: newDate.toISOString().split("T")[0],
      price,
    };
  });
}
