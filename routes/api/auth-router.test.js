import app from "../../app.js";
import mongoose from "mongoose";
import request from "supertest";
import User from "../../models/User.js";
import { token } from "morgan";

const { DB_TEST_HOST, PORT } = process.env;

describe("test /users/login rotute", () => {
  let server = null;
  beforeAll(async () => {
    await mongoose.connect(DB_TEST_HOST);
    server = app.listen(PORT);
  });

  afterAll(async () => {
    server.close();
  });

  test("test login with correct data", async () => {
    const loginData = { password: "12345678", email: "petrova1512@gmail.com" };

    const { body, statusCode } = await request(app)
      .post("/users/login")
      .send(loginData);

    const user = await User.findOne({ email: loginData.email });

    expect(statusCode).toBe(200);
    expect(body.user.email).toBe(loginData.email);
    expect(user.email).toBe(loginData.email);
    expect(body).toHaveProperty("token");
    expect(body.user).toHaveProperty("email");
    expect(body.user).toHaveProperty("subscription");
    expect(Object.keys(body.user)).toHaveLength(2);
    expect(typeof body.token).toBe("string");
    expect(typeof body.user.email).toBe("string");
    expect(typeof body.user.subscription).toBe("string");
  });
});
