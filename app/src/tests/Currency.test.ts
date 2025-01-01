import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import Crypto from "../domain/entities/Crypto/Crypto";
import { CurrencyRepository } from "../infra/repositories/CurrencyRepository";
import { afterEach } from "node:test";

jest.setTimeout(60000);
jest.mock("../infra/repositories/CurrencyRepository");
jest.mock("../domain/entities/Crypto/Crypto");

describe("CurrencyRepository", () => {
  let currencyRepository: jest.Mocked<CurrencyRepository>;

  beforeEach(() => {
    currencyRepository =
      new CurrencyRepository() as jest.Mocked<CurrencyRepository>;
  });

  describe("saveCryptoData", () => {
    const validateData = (data: any[]) => {
      data.forEach((crypto) => {
        if (
          isNaN(crypto.priceUsd) ||
          isNaN(crypto.volumeUsd24Hr) ||
          isNaN(crypto.marketCapUsd)
        ) {
          throw new Error(`Invalid data: ${JSON.stringify(crypto)}`);
        }
      });
    };

    it("should save crypto data with timestamps", async () => {
      jest.spyOn(Crypto, "find").mockImplementationOnce(() => [
        {
          name: "Bitcoin",
          price: 50000,
          volume: 1200,
          marketCap: 900000,
        },
      ]);
      const data = [
        {
          id: "crypto1",
          name: "Bitcoin",
          priceUsd: 50000,
          volumeUsd24Hr: 1200,
          marketCapUsd: 900000,
        },
      ];

      validateData(data);

      currencyRepository.saveCryptoData.mockResolvedValueOnce();

      await currencyRepository.saveCryptoData(data);

      const savedCrypto = await Crypto.find({ name: "Bitcoin" });

      expect(savedCrypto.length).toBeGreaterThan(0);
      expect(savedCrypto[0].name).toBe("Bitcoin");
      expect(savedCrypto[0].price).toBe(50000);
      expect(savedCrypto[0].volume).toBe(1200);
      expect(savedCrypto[0].marketCap).toBe(900000);
    });

    it("should save multiple cryptocurrencies", async () => {
      jest.spyOn(Crypto, "find").mockImplementationOnce(() => [
        {
          name: "Ripple",
        },
        {
          name: "Litecoin",
        },
      ]);
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
      currencyRepository.saveCryptoData.mockResolvedValueOnce(undefined);

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
          priceUsd: NaN,
          volumeUsd24Hr: 5000,
          marketCapUsd: 100000,
        },
      ];

      expect(() => validateData(invalidData)).toThrowError(/Invalid data/);

      try {
        await currencyRepository.saveCryptoData(invalidData);
      } catch (error) {
        console.log({ loggedError: error.message });
        expect(error.message).toMatch(/Invalid data/);
      }
    });
  });
});
