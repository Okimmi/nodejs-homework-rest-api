import express from "express";
import authController from "../../controllers/auth-controller.js";
import { isEmptyBody, authenticate, upload } from "../../middlewares/index.js";

const authRouter = express.Router();

authRouter.post("/register", isEmptyBody, authController.register);
authRouter.post("/login", isEmptyBody, authController.login);
authRouter.get("/current", authenticate, authController.getCurrent);
authRouter.post("/verify", isEmptyBody, authController.resendVerify);
authRouter.get("/verify/:verificationToken", authController.verify);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.patch("/", authenticate, authController.updateSubscription);
authRouter.patch(
  "/avatars",
  upload.single("avatarURL"),
  authenticate,
  authController.updateAvatar
);

export default authRouter;
