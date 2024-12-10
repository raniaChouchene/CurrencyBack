import axios from "axios";
import {
  getCryptoData,
  saveCryptoDataToDB,
  getMostRecentCryptoPrices,
} from "~/application/controllers/CryptoController";
import { CurrencyRepository } from "~/infra/repositories/CurrencyRepository";
import { jest } from "@jest/globals";
import { describe, it, beforeEach } from "node:test";
import expect from "expect";
import { any } from "joi";

jest.mock("axios");
jest.mock("~/infra/repositories/CurrencyRepository");

describe("Crypto Data Functions", () => {
  let mockCurrencyRepository: jest.Mocked<CurrencyRepository>;

  beforeEach(() => {
    mockCurrencyRepository =
      new CurrencyRepository() as jest.Mocked<CurrencyRepository>;
    jest.clearAllMocks();
  });

  describe("saveCryptoDataToDB", () => {
    it("should save crypto data with timestamps", async () => {
      const mockData = [
        { id: "crypto1", name: "Bitcoin" },
        { id: "crypto2", name: "Ethereum" },
      ];
      mockCurrencyRepository.saveCryptoData.mockResolvedValue(undefined);

      await saveCryptoDataToDB();

      expect(mockCurrencyRepository.saveCryptoData).toHaveBeenCalledWith(
        mockData
      );
    });
  });

  describe("getMostRecentCryptoPrices", () => {
    it("should return the most recent prices from the repository", async () => {
      const mockPrices = [
        { id: "crypto1", priceUsd: "50000" },
        { id: "crypto2", priceUsd: "4000" },
      ];
      mockCurrencyRepository.getMostRecentPrices.mockResolvedValue(mockPrices);

      const result = await getMostRecentCryptoPrices();

      expect(mockCurrencyRepository.getMostRecentPrices).toHaveBeenCalled();
      expect(result).toEqual(mockPrices);
    });
  });
});
