import { Router } from "express";
import { userRouter } from "~/infra/routers/UserRouter";

import passport from "passport";
import { currencyRouter } from "../routers/CurrencyRepository";

const router = Router();

router.use("/users", userRouter);
router.use("/cryptocurrencies", currencyRouter);
// router.use(passport.authenticate("jwt", { session: true }));

export { router };
