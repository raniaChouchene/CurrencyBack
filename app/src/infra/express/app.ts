import express from "express";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import connectToDatabase from "../../infra/database";
import passportStrategy from "../../infra/config/passport";
import { router } from "./routes";

const app = express();

connectToDatabase();

passportStrategy(passport);
app.use(passport.initialize());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(router);

export { app };
