import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import Crypto, { ICrypto } from "../domain/entities/Crypto/Crypto";
import { CurrencyRepository } from "../infra/repositories/CurrencyRepository";

jest.setTimeout(60000);
jest.mock("../domain/entities/Crypto/Crypto");

describe("CurrencyRepository", () => {
  let currencyRepository: CurrencyRepository;

  beforeEach(() => {
    currencyRepository = new CurrencyRepository();
  });
  describe("getLast30CryptoPrices", () => {
    it("should return the last 30 crypto prices", async () => {
      const mockData = [
        {
          name: "Bitcoin",
          data: [
            { timestamp: new Date(), value: 50000 },
            { timestamp: new Date(), value: 52000 },
            { timestamp: new Date(), value: 51000 },
          ],
        },
      ];

      jest.spyOn(Crypto, "aggregate").mockResolvedValueOnce(mockData);

      const result = await currencyRepository.getLast30CryptoPrices();

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].name).toBe("Bitcoin");
      expect(result[0].data.length).toBe(3);
    });

    it("should handle errors when fetching the last 30 crypto prices", async () => {
      jest
        .spyOn(Crypto, "aggregate")
        .mockRejectedValueOnce(new Error("DB Error"));

      await expect(
        currencyRepository.getLast30CryptoPrices()
      ).rejects.toThrowError(/DB Error/);
    });

    it("should return an empty array if no data is found", async () => {
      jest.spyOn(Crypto, "aggregate").mockResolvedValueOnce([]);

      const result = await currencyRepository.getLast30CryptoPrices();

      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });
  describe("saveCryptoData", () => {
    it("should save crypto data", async () => {
      const mockData = [
        {
          id: 1,
          name: "Bitcoin",
          symbol: "BTC",
          priceUsd: "50000",
          volumeUsd24Hr: "1000000",
          marketCapUsd: "900000000",
        },
      ];

      jest.spyOn(Crypto.prototype, "save").mockResolvedValueOnce(mockData[0]);

      await currencyRepository.saveCryptoData(mockData);

      expect(Crypto.prototype.save).toHaveBeenCalledTimes(1);
    });

    it("should handle errors when saving crypto data", async () => {
      const mockData = [
        {
          id: 1,
          name: "Bitcoin",
          symbol: "BTC",
          priceUsd: "50000",
          volumeUsd24Hr: "1000000",
          marketCapUsd: "900000000",
        },
      ];

      jest
        .spyOn(Crypto.prototype, "save")
        .mockRejectedValueOnce(new Error("Save Error"));

      await expect(
        currencyRepository.saveCryptoData(mockData)
      ).rejects.toThrowError(/Save Error/);
    });
  });

  describe("getCryptoByName", () => {
    it("should return crypto data by name", async () => {
      const mockData: Partial<ICrypto> = {
        id: "some-id",
        symbol: "BTC",
        name: "Bitcoin",
        price: 50000,
        volume: 1000,
        marketCap: 1000000,
        timestamp: new Date(),
      };

      jest.spyOn(Crypto, "findOne");

      const result = await currencyRepository.getCryptoByName("Bitcoin");

      expect(result).toBeDefined();
      expect(result.name).toBe("Bitcoin");
    });

    it("should handle errors when fetching crypto data by name", async () => {
      jest
        .spyOn(Crypto, "findOne")
        .mockRejectedValueOnce(new Error("DB Error"));

      await expect(
        currencyRepository.getCryptoByName("Bitcoin")
      ).rejects.toThrowError(/DB Error/);
    });
  });
});
