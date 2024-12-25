import { Router } from "express";
import { userRouter } from "~/infra/routers/UserRouter";

import passport from "passport";
import { currencyRouter } from "../routers/CurrencyRouter";
import { alertRouter } from "../routers/AlertRouter";

const router = Router();

router.use("/users", userRouter);
router.use("/cryptocurrencies", currencyRouter);
router.use("/alert", alertRouter);
// router.use(passport.authenticate("jwt", { session: true }));

export { router };
