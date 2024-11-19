import axios from "axios";
import { CurrencyRepository } from "~/infra/repositories/CurrencyRepository";

const getCryptoData = async () => {
  try {
    const response = await axios.get("https://api.coincap.io/v2/assets");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw error;
  }
};

const saveCryptoDataToDB = async () => {
  const data = await getCryptoData();
  const currencyRepository = new CurrencyRepository();
  await currencyRepository.saveCryptoData(data);
};

export { saveCryptoDataToDB };
