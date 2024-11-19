import mongoose from "mongoose";
import { IcurrencyRepository } from "~/application/repositories/ICurrencyRepository";
import Crypto from "~/domain/entities/Crypto/Crypto";

class CurrencyRepository implements IcurrencyRepository {
  async getAllCryptoData() {
    try {
      return await Crypto.find();
    } catch (error) {
      console.error("Error fetching data from DB:", error);
      throw error;
    }
  }

  async saveCryptoData(data: any) {
    try {
      for (let item of data) {
        const crypto = new Crypto({
          id: item.id,
          name: item.name,
          price: parseFloat(item.priceUsd),
          volume: parseFloat(item.volumeUsd24Hr),
          marketCap: parseFloat(item.marketCapUsd),
        });
        await crypto.save();
      }
    } catch (error) {
      console.error("Error saving crypto data to DB:", error);
      throw error;
    }
  }
}

export { CurrencyRepository };
