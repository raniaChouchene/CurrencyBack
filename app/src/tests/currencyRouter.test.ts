import request from "supertest";
import express from "express";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Crypto from "../domain/entities/Crypto/Crypto";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { currencyRouter } from "~/infra/routers/CurrencyRouter";

let mongoServer: MongoMemoryServer;
let app: express.Application;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use("/cryptocurrencies", currencyRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Crypto.deleteMany({});
});

describe("Currency API Integration Tests", () => {
  describe("GET /cryptocurrencies/test", () => {
    it("should return a successful test route response", async () => {
      const response = await request(app).get("/api/test");
    });
  });

  describe("GET /cryptocurrencies/save", () => {
    it("should save crypto data to the database", async () => {
      const response = await request(app).get("/api/save");
    });
  });

  describe("GET /cryptocurrencies/", () => {
    it("should fetch all crypto data", async () => {
      const mockCryptoData = [
        {
          id: "crypto1",
          name: "Bitcoin",
          price: 50000,
          volume: 1200,
          marketCap: 900000,
          timestamp: new Date(),
        },
      ];

      await Crypto.insertMany(mockCryptoData);

      const response = await request(app).get("/cryptocurrencies/");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe("Bitcoin");
    });

    it("should return an error if fetching crypto data fails", async () => {
      jest.spyOn(Crypto, "find").mockImplementationOnce(() => {
        throw new Error("Failed to fetch data.");
      });

      const response = await request(app).get("/cryptocurrencies/");

      expect(response.status).toBe(500);
      expect(response.text).toBe("Error fetching crypto data.");
    });
  });

  describe("GET /cryptocurrencies/prices/:cryptoId", () => {
    it("should return the prices of a specific crypto", async () => {
      const mockCryptoData = {
        id: "crypto1",
        name: "Bitcoin",
        price: 50000,
        volume: 1200,
        marketCap: 900000,
        timestamp: new Date(),
      };

      await Crypto.create(mockCryptoData);

      const response = await request(app).get(
        "/cryptocurrencies/prices/crypto1"
      );

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].price).toBe(50000);
    });

    it("should return an error if prices are not found", async () => {
      const response = await request(app).get(
        "/cryptocurrencies/prices/unknownCrypto"
      );
    });
  });

  describe("GET /cryptocurrencies/most-recent", () => {
    it("should return the most recent crypto data", async () => {
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

      await Crypto.insertMany(mockData);

      const response = await request(app).get("/cryptocurrencies/most-recent");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe("Bitcoin");
    });
  });

  describe("POST /cryptocurrencies/forecast", () => {
    it("should return a forecast result for a specific crypto", async () => {
      const forecastPayload = { currencyName: "Bitcoin" };
      const response = await request(app)
        .post("/api/forecast")
        .send(forecastPayload);
    });
  });
});
