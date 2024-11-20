import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  getCryptoData,
  saveCryptoDataToDB,
} from "../controllers/CryptoController";
import { CurrencyRepository } from "~/infra/repositories/CurrencyRepository";

jest.mock("~/infra/repositories/CurrencyRepository", () => ({
  CurrencyRepository: jest.fn().mockImplementation(() => ({
    saveCryptoData: jest.fn(),
  })),
}));

describe("Crypto Service", () => {
  let mockAxios;
  let mockCurrencyRepository;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    mockCurrencyRepository = new CurrencyRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockAxios.reset();
  });

  test("getCryptoData should fetch the first 10 cryptocurrencies", async () => {
    const mockData = {
      data: Array(10).fill({ name: "Bitcoin", priceUsd: 50000 }),
    };
    mockAxios.onGet("https://api.coincap.io/v2/assets").reply(200, mockData);

    const result = await getCryptoData();
    expect(result).toHaveLength(10);
    expect(result[0].name).toBe("Bitcoin");
  });

  test("getCryptoData should handle errors when API fails", async () => {
    mockAxios.onGet("https://api.coincap.io/v2/assets").reply(500);

    await expect(getCryptoData()).rejects.toThrow(
      "Error fetching crypto data:"
    );
  });

  test("saveCryptoDataToDB should save the fetched crypto data to the database", async () => {
    const mockData = {
      data: Array(10).fill({ name: "Bitcoin", priceUsd: 50000 }),
    };
    mockAxios.onGet("https://api.coincap.io/v2/assets").reply(200, mockData);

    await saveCryptoDataToDB();
    expect(mockCurrencyRepository.saveCryptoData).toHaveBeenCalledTimes(1);
  });

  test("saveCryptoDataToDB should handle errors when saving to the DB", async () => {
    mockAxios.onGet("https://api.coincap.io/v2/assets").reply(500);

    await expect(saveCryptoDataToDB()).rejects.toThrow(
      "Error saving crypto data to DB:"
    );
  });
});
