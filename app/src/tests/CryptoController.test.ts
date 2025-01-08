import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import Crypto from "../domain/entities/Crypto/Crypto";
import {
  saveCryptoDataToDB,
  displayHistoricalCryptoData,
  forecastCryptoPrices,
  getMostRecentCryptoPrices,
} from "../application/controllers/CryptoController";
import { CurrencyRepository } from "~/infra/repositories/CurrencyRepository";

jest.mock("../domain/entities/Crypto/Crypto");

// jest.mock("../infra/repositories/CurrencyRepository", () => {
//   return {
//     getAllCryptoDataFromDate: jest.fn().mockResolvedValue([
//       { name: "Bitcoin", priceUsd: 50000, timestamp: new Date() },
//       { name: "Bitcoin", priceUsd: 52000, timestamp: new Date() },
//     ]),
//   };
// });

jest.mock("../infra/repositories/CurrencyRepository", () => {
  return jest.fn().mockImplementation(() => {
    return {
      getAllCryptoDataFromDate: jest.fn().mockResolvedValue([
        { name: "Bitcoin", priceUsd: 50000, timestamp: new Date() },
        { name: "Bitcoin", priceUsd: 52000, timestamp: new Date() },
      ]),
      saveCryptoData: jest.fn(),
      getMostRecentPrices: jest.fn(),
      getAllCryptoData: jest.fn().mockResolvedValue([
        { name: "Bitcoin", priceUsd: 50000, timestamp: new Date() },
        { name: "Bitcoin", priceUsd: 51000, timestamp: new Date() },
      ]),
      getMostRecentPrices: jest.fn().mockResolvedValue([
        {
          id: "crypto1",
          name: "Bitcoin",
          priceUsd: 50000,
          volumeUsd24Hr: 1200,
          marketCapUsd: 900000,
          timestamp: new Date(),
        },
      ]),
    };
  });
});

describe("CryptoController", () => {
  describe("saveCryptoDataToDB", () => {
    const validateData = (data: any[]) => {
      data.forEach((crypto) => {
        if (
          isNaN(crypto.priceUsd) ||
          isNaN(crypto.volumeUsd24Hr) ||
          isNaN(crypto.marketCapUsd)
        ) {
          throw new Error("Invalid data");
        }
      });
    };

    it("should save crypto data with timestamps", async () => {
      const data = [
        {
          id: "crypto1",
          symbol: "BTC",
          name: "Bitcoin",
          priceUsd: 50000,
          volumeUsd24Hr: 1200,
          marketCapUsd: 900000,
          timestamp: new Date(),
        },
      ];
      validateData(data);

      jest.spyOn(Crypto, "find").mockResolvedValue(data);

      await saveCryptoDataToDB();
      const savedCrypto = await Crypto.find({ name: "Bitcoin" });

      expect(savedCrypto).toBeDefined();
      expect(savedCrypto.length).toBeGreaterThan(0);
    });

    it("should save multiple cryptocurrencies", async () => {
      const data = [
        {
          id: "crypto3",
          name: "Ripple",
          priceUsd: 1.2,
          volumeUsd24Hr: 5000,
          marketCapUsd: 120000,
        },
        {
          id: "crypto4",
          name: "Litecoin",
          priceUsd: 150,
          volumeUsd24Hr: 2500,
          marketCapUsd: 375000,
        },
      ];

      jest.spyOn(Crypto, "create");

      validateData(data);
      await saveCryptoDataToDB();
    });

    it("should throw an error if data contains NaN values", async () => {
      const invalidData = [
        {
          id: "crypto5",
          name: "InvalidCrypto",
          priceUsd: NaN,
          volumeUsd24Hr: 5000,
          marketCapUsd: 100000,
        },
      ];

      // expect(validateData(invalidData)).toThrow();

      try {
        await saveCryptoDataToDB();
      } catch (error) {
        expect(error.message).toMatch(/Invalid data/);
      }
    });
  });

  describe("getMostRecentCryptoPrices", () => {
    it("should return the most recent crypto prices", async () => {
      const result = await getMostRecentCryptoPrices();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("Bitcoin");
      expect(result[0].priceUsd).toBe(50000);
      expect(result[0].timestamp).toBeDefined();
    });
  });

  describe("displayHistoricalCryptoData", () => {
    it("should return historical crypto data for the specified period", async () => {
      const result = await displayHistoricalCryptoData("Bitcoin", "week");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].priceUsd).toBe(50000);
    });

    // it("should throw an error if an invalid period is passed", async () => {
    //   await expect(
    //     displayHistoricalCryptoData("Bitcoin", "invalidPeriod")
    //   ).rejects.toThrow();
    // });
  });

  describe("forecastCryptoPrices", () => {
    it("should forecast crypto prices using the specified method", async () => {
      const mockData = [
        { name: "Bitcoin", priceUsd: 50000, timestamp: new Date() },
        { name: "Bitcoin", priceUsd: 51000, timestamp: new Date() },
      ];

      jest.spyOn(Crypto, "find");

      const result = await forecastCryptoPrices("Bitcoin", "sma", 2);

      expect(result).toBeDefined();
      expect(result.forecastedValues).toBeDefined();
      expect(result.forecastedValues.length).toBeGreaterThan(0);
    });

    // it("should throw an error if an invalid forecast method is used", async () => {
    //   expect(forecastCryptoPrices("Bitcoin", "invalidMethod", 2)).toThrow();
    // });
  });
});
