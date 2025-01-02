import { Router } from "express";
import { userRouter } from "~/infra/routers/UserRouter";

import passport from "passport";
import { currencyRouter } from "../routers/CurrencyRouter";
import { alertRouter } from "../routers/AlertRouter";

const router = Router();
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *
 */
router.use("/users", userRouter);
/**
 * @swagger
 * /cryptocurrencies:
 *   get:
 *     summary: Get all cryptocurrencies
 */
router.use("/cryptocurrencies", currencyRouter);
/**
 * @swagger
 * /alert:
 *   post:
 *     summary: Create a new alert
 *
 */
router.use("/alert", alertRouter);

export { router };
