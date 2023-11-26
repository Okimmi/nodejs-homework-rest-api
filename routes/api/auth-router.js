import express from "express";
import authController from "../../controllers/auth-controller.js";
import { isEmptyBody, authenticate } from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, authController.register);
authRouter.post("/login", isEmptyBody, authController.login);
authRouter.get("/current", authenticate, authController.getCurrent);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.patch("/", authenticate, authController.updateSubscription);

export default authRouter;
