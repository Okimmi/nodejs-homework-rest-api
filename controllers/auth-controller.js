import { HttpError } from "../helpers/index.js";
import User, {
  userRegisterSchema,
  userSignInSchema,
  userSubscriptionSchema,
  userAvatarSchema,
} from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import gravatar from "gravatar";
import jimp from "jimp";

const { JWT_SECRET } = process.env;

const avatarPath = path.resolve("public", "avatars");

const register = async (req, res, next) => {
  try {
    const { error } = userRegisterSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }

    const avatarURL = gravatar.url(email).slice(2);

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
    });
    res.status(201).json({
      user: { email: result.email, subscription: result.subscription },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = userSignInSchema.validate(req.body);

    if (error) {
      throw HttpError(400, error.message);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const payload = { id: user._id };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204);
};

const updateSubscription = async (req, res, next) => {
  try {
    const { error } = userSubscriptionSchema.validate(req.body);

    if (error) {
      throw HttpError(400, error.message);
    }

    const { subscription } = req.body;
    const { _id, email } = req.user;

    await User.findByIdAndUpdate(_id, { subscription });
    res.json({
      user: { email, subscription },
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { error } = userAvatarSchema.validate(req.body);
    if (error) {
      throw HttpError(400, error.message);
    }

    const { _id } = req.user;

    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarPath, filename);

    await fs.rename(oldPath, newPath);

    const avatarURL = path.join("avatars", filename);

    jimp.read(path.resolve("public", avatarURL), (err, img) => {
      if (err) {
        throw HttpError(400, err.message);
      }
      img.resize(250, 250).write(path.resolve("public", avatarURL));
    });

    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getCurrent,
  logout,
  updateSubscription,
  updateAvatar,
};
