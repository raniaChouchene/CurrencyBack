import { afterAll, jest } from "@jest/globals";
import { describe, it, beforeEach } from "node:test";
import expect from "expect";
import { UserController } from "~/application/controllers/UserController";
import { Request, Response } from "express";
import mongoose from "mongoose";

const mockCreateUseCase = {
  //@ts-expect-error
  create: jest.fn().mockResolvedValue({
    _id: "123456789",
    name: "John Doe",
    username: "johndoe",
    password: "password123",
  }),
};

describe("UserController", () => {
  let userController: UserController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {
        name: "John Doe",
        username: "johndoe",
        password: "password123",
      },
    };

    mockRes = {
      //@ts-expect-error
      status: jest.fn().mockReturnValue(mockRes as Response),
      //@ts-expect-error
      json: jest.fn().mockReturnValue(mockRes),
    };
    //@ts-expect-error
    userController = new UserController(mockCreateUseCase);
  });

  it("should create a new user", async () => {
    await userController.create(mockReq as Request, mockRes as Response);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalled();
  });

  afterAll(() => {
    mongoose.disconnect();
  });
});
