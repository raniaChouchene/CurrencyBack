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
      for (const item of data) {
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

  async getMostRecentPrices() {
    try {
      const recentData = await Crypto.aggregate([
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: "$id",
            name: { $first: "$name" },
            price: { $first: "$price" },
            volume: { $first: "$volume" },
            marketCap: { $first: "$marketCap" },
            timestamp: { $first: "$timestamp" },
          },
        },
        {
          $project: {
            _id: 0,
            id: "$_id",
            name: 1,
            price: 1,
            volume: 1,
            marketCap: 1,
            timestamp: 1,
          },
        },
      ]);

      return recentData;
    } catch (error) {
      console.error("Error fetching most recent crypto prices:", error);
      throw error;
    }
  }
}

export { CurrencyRepository };
