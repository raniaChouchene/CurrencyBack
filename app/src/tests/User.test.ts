import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserController } from "../application/controllers/UserController";
import { Request, Response } from "express";
import { ICreateUserUseCase } from "~/domain/useCases/User/ICreateUserUseCase";
import { SECRET_KEY } from "~/infra/constants/env";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.setTimeout(60000);

describe("UserController", () => {
  let userController: UserController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockCreateUserUseCase: jest.Mocked<ICreateUserUseCase>;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    //@ts-expect-error
    mockCreateUserUseCase = {
      create: jest.fn(),
    } as jest.Mocked<ICreateUserUseCase>;

    mockReq = {
      body: {
        name: "rania",
        username: "rania",
        password: "password123",
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Partial<Response>;

    userController = new UserController(mockCreateUserUseCase);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("should create a new user and return a token", async () => {
      const userData = {
        name: "rania",
        username: "rania",
        password: "password123",
      };

      const hashedPassword = "hashedPassword";
      const mockToken = "mockedToken";

      mockCreateUserUseCase.create.mockResolvedValue({
        id: "123",
        name: "rania",
        username: "rania",
        password: hashedPassword,
      });

      await userController.create(mockReq as Request, mockRes as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 8);
      expect(jwt.sign).toHaveBeenCalledWith({ id: "123" }, SECRET_KEY, {
        expiresIn: "1d",
      });
    });
  });

  it("should return 400 if user data is missing", async () => {
    mockReq.body = {};
    await userController.create(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Fill required fields",
    });
  });
});
