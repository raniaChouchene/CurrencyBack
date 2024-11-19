import { Router } from "express";
import passport from "passport";
import { UserController } from "~/application/controllers/UserController";
import { generateJWT } from "~/application/middlewares/AuthMiddleware";
import { CreateUserUseCase } from "~/application/useCases/User/CreateUserUseCase";
import { CreateUserValidator } from "~/application/validators/CreateUserValidator";
import { UserRepository } from "../repositories/UserRepository";

const router = Router();

const userRepository = new UserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);
router.get("/test", (req, res) => {
  res.status(200).send("Test route is working!");
});

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  userController.index
);

router.post("/login", generateJWT);

router.post("/register", CreateUserValidator, userController.create);

export { router as userRouter };
