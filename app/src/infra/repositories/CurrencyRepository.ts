import mongoose from "mongoose";
import { IcurrencyRepository } from "../../application/repositories/ICurrencyRepository";
import Crypto from "../../domain/entities/Crypto/Crypto";

class CurrencyRepository implements IcurrencyRepository {
  async getAllCryptoData() {
    try {
      return await Crypto.find();
    } catch (error) {
      console.error("Error fetching data from DB:", error);
      throw error;
    }
  }

  async getAllCryptoDataFromDate(date: Date, name: string) {
    try {
      return await Crypto.find({ timestamp: { $gte: date }, name: name });
    } catch (error) {
      console.error("Error fetching data from DB:", error);
      throw error;
    }
  }

  public async getCryptoByName(cryptoName: string): Promise<any> {
    try {
      const cryptoData = await Crypto.findOne({ name: cryptoName });
      return cryptoData;
    } catch (error) {
      console.error("Error fetching crypto data by name:", error);
      throw error;
    }
  }

  async saveCryptoData(data: any) {
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

  async getLast30CryptoPrices() {
    try {
      const data = await Crypto.aggregate([
        {
          $sort: { timestamp: -1 },
        },
        {
          $group: {
            _id: "$name",
            data: {
              $push: {
                timestamp: "$timestamp",
                value: "$price",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id",
            data: { $slice: ["$data", 30] },
          },
        },
      ]);

      return data.map((crypto) => ({
        name: crypto.name,
        data: crypto.data.reverse(),
      }));
    } catch (error) {
      console.error("Error fetching last 30 crypto prices:", error);
      throw error;
    }
  }
}

export { CurrencyRepository };
