import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import Crypto from "../domain/entities/Crypto/Crypto";
import { CurrencyRepository } from "../infra/repositories/CurrencyRepository";
import {
  displayHistoricalCryptoData,
  forecastCryptoPrices,
} from "~/application/controllers/CryptoController";

jest.setTimeout(60000);
jest.mock("../domain/entities/Crypto/Crypto");

describe("CryptoController", () => {
  let cryptoController;

  beforeEach(() => {
    cryptoController = new cryptoController();
  });

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
      jest.spyOn(Crypto, "create");

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
      await cryptoController.saveCryptoDataToDB(data);
      const savedCrypto = await Crypto.find({ name: "Bitcoin" });

      expect(savedCrypto).toBeDefined();
      expect(savedCrypto.length).toBeGreaterThan(0);
      expect(savedCrypto[0].price).toBe(50000);
      expect(savedCrypto[0].volume).toBe(1200);
      expect(savedCrypto[0].marketCap).toBe(900000);
    });

    it("should save multiple cryptocurrencies", async () => {
      jest
        .spyOn(Crypto, "create")
        .mockImplementation(() =>
          Promise.resolve([{ name: "Ripple" }, { name: "Litecoin" }])
        );
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

      validateData(data);
      await cryptoController.saveCryptoDataToDB(data);
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

      expect(() => validateData(invalidData)).toThrowError(/Invalid data/);

      try {
        await cryptoController.saveCryptoDataToDB(invalidData);
      } catch (error) {
        expect(error.message).toMatch(/Invalid data/);
      }
    });
  });

  describe("getMostRecentCryptoPrices", () => {
    it("should return the most recent crypto prices", async () => {
      const mockData = [
        {
          id: "crypto1",
          name: "Bitcoin",
          price: 50000,
          volume: 1200,
          marketCap: 900000,
          timestamp: new Date(),
        },
      ];

      jest.spyOn(Crypto, "aggregate").mockResolvedValueOnce(mockData);

      const result = await cryptoController.getMostRecentCryptoPrices();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("Bitcoin");
      expect(result[0].price).toBe(50000);
      expect(result[0].timestamp).toBeDefined();
    });
  });
  describe("displayHistoricalCryptoData", () => {
    it("should return historical crypto data for the specified period", async () => {
      const mockData = [
        { name: "Bitcoin", priceUsd: 50000, timestamp: new Date() },
        { name: "Bitcoin", priceUsd: 52000, timestamp: new Date() },
      ];

      const result = await displayHistoricalCryptoData("Bitcoin", "week");

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].priceUsd).toBe(52000);
    });

    it("should throw an error if an invalid period is passed", async () => {
      await expect(
        displayHistoricalCryptoData("Bitcoin", "invalidPeriod")
      ).rejects.toThrowError(
        "Invalid period. Please specify 'month' or 'week'."
      );
    });
  });

  describe("forecastCryptoPrices", () => {
    it("should forecast crypto prices using the specified method", async () => {
      const mockData = [
        { name: "Bitcoin", price: 50000, timestamp: new Date() },
        { name: "Bitcoin", price: 51000, timestamp: new Date() },
      ];

      const result = await forecastCryptoPrices("Bitcoin", "sma", 2);

      expect(result).toBeDefined();
      expect(result.forecastedValues).toBeDefined();
      expect(result.forecastedValues.length).toBeGreaterThan(0);
    });

    it("should throw an error if an invalid forecast method is used", async () => {
      await expect(forecastCryptoPrices("Bitcoin", "invalidMethod", 2));
    });
  });
});
