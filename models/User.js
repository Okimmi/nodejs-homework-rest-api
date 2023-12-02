import { Schema, model } from "mongoose";
import { handlerSaveError } from "./hooks.js";
import Joi from "joi";

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: { type: String },
    token: { type: String },
  },
  { versionKey: false, timestamps: true }
);

export const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  subscription: Joi.string().valid("starter", "pro", "business"),
});

export const userSignInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const userSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

export const userAvatarSchema = Joi.object({
  avatarURL: Joi.string(),
});

userSchema.post("save", handlerSaveError);
userSchema.post("findOneAndUpdate", handlerSaveError);

const User = model("user", userSchema);

export default User;
