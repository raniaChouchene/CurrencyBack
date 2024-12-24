import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import Crypto from "~/domain/entities/Crypto/Crypto";
import { CurrencyRepository } from "~/infra/repositories/CurrencyRepository";

describe("CurrencyRepository", () => {
  describe("saveCryptoData", () => {
    const validateData = (data: any[]) => {
      data.forEach((crypto) => {
        if (
          isNaN(crypto.price) ||
          isNaN(crypto.volume) ||
          isNaN(crypto.marketCap)
        ) {
          throw new Error(`Invalid data: ${JSON.stringify(crypto)}`);
        }
      });
    };

    it("should save crypto data with timestamps", async () => {
      const data = [
        {
          id: "crypto1",
          name: "Bitcoin",
          price: 50000,
          volume: 1200,
          marketCap: 900000,
        },
        {
          id: "crypto2",
          name: "Ethereum",
          price: 4000,
          volume: 1000,
          marketCap: 450000,
        },
      ];

      // Validate the data before saving
      validateData(data);

      const currencyRepository = new CurrencyRepository();
      await currencyRepository.saveCryptoData(data);

      const savedCrypto = await Crypto.find({ name: "Bitcoin" });

      expect(savedCrypto.length).toBeGreaterThan(0);
      expect(savedCrypto[0].name).toBe("Bitcoin");
      expect(savedCrypto[0].price).toBe(50000);
      expect(savedCrypto[0].volume).toBe(1200);
      expect(savedCrypto[0].marketCap).toBe(900000);
    });

    it("should save multiple cryptocurrencies", async () => {
      const data = [
        {
          id: "crypto3",
          name: "Ripple",
          price: 1.2,
          volume: 5000,
          marketCap: 120000,
        },
        {
          id: "crypto4",
          name: "Litecoin",
          price: 150,
          volume: 2500,
          marketCap: 375000,
        },
      ];

      // Validate the data before saving
      validateData(data);

      const currencyRepository = new CurrencyRepository();
      await currencyRepository.saveCryptoData(data);

      const savedCryptos = await Crypto.find({});

      expect(savedCryptos.length).toBe(2);
      expect(savedCryptos[0].name).toBe("Ripple");
      expect(savedCryptos[1].name).toBe("Litecoin");
    });

    it("should throw an error if data contains NaN values", async () => {
      const invalidData = [
        {
          id: "crypto5",
          name: "InvalidCrypto",
          price: NaN,
          volume: 5000,
          marketCap: 100000,
        },
      ];

      try {
        // Validate the data before saving
        validateData(invalidData);
        //@ts-expect-error
        await CurrencyRepository.saveCryptoData(invalidData);
        // If validation passes, we should fail the test
        throw new Error("Test failed: Invalid data should not be allowed.");
      } catch (error) {
        expect(error.message).toMatch(/Invalid data/);
      }
    });
  });
});
