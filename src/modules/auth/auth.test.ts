/* eslint-disable unused-imports/no-unused-vars */
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db";
import { userTable } from "@/db/schema/users";
import env from "@/env";
import createApp from "@/lib/create-app";
import { generateOrReuseOTP } from "@/lib/encryption";

import { getUserByEmail } from "../users/users.services";
import router from "./auth.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

// Test user details
const testUser = {
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  password: "Password123!",
};

let activationOTP: string;
let resetOTP: string;
let accessToken: string;
let refreshTokenValue: string;

const client = testClient(createApp().route("/auth", router));

describe("auth Routes", () => {
  beforeAll(async () => {
    execSync("pnpm db:generate");
    execSync("pnpm db:migrate");
  });

  beforeEach(async () => {
    await db.delete(userTable);
  });

  afterAll(async () => {
    await db.delete(userTable); // Clean up after all tests run
  });

  it("should register a user successfully", async () => {
    const res = await client.auth.register.$post({
      json: testUser,
    });
    expect(res.status).toBe(201);
    //     if (res.status === 201) {
    //       const data = await res.json();
    //       expect(data.success).toBe(true);
    //       expect(data.message).toBe("User created Successfully");
    //     }
  });

  it("should not allow duplicate registration", async () => {
    await client.auth.register.$post({
      json: testUser,
    });
    const res = await client.auth.register.$post({
      json: testUser,
    });
    expect(res.status).toBe(400);
    //     if (res.status === 400) {
    //       const data = await res.json();
    //       expect(data.success).toBe(false);
    //       expect(data.message).toBe("Email already exists");
    //     }
  });

  it("should activate user account with valid OTP", async () => {
    // Register the user first
    await client.auth.register.$post({
      json: testUser,
    });

    // Get user from database
    const user = await getUserByEmail({
      email: testUser.email,
      withPassword: false,
    });

    if (user) {
      // Generate OTP manually (mocked)
      activationOTP = await generateOrReuseOTP(user.id, "activation");
      const res = await client.auth.activation.$post({
        json: {
          email: testUser.email,
          otp: activationOTP,
        },
      });
      expect(res.status).toBe(200);
      // if (res.status === 200) {
      //   const data = await res.json();
      //   expect(data.success).toBe(true);
      //   expect(data.message).toBe("Account activated successfully");
      // }
    }
  });

  it("should not activate user with invalid OTP", async () => {
    await client.auth.register.$post({
      json: testUser,
    });

    const res = await client.auth.activation.$post({
      json: {
        email: testUser.email,
        otp: activationOTP,
      },
    });

    expect(res.status).toBe(400);
    //     if (res.status === 400) {
    //       const data = await res.json();
    //       expect(data.success).toBe(false);
    //       expect(data.message).toBe("Invalid or Expired OTP");
    //     }
  });

  it("should login with correct credentials", async () => {
    await client.auth.register.$post({
      json: testUser,
    });

    // Activate user
    const user = await getUserByEmail({
      email: testUser.email,
      withPassword: false,
    });
    if (user) {
      activationOTP = await generateOrReuseOTP(user.id, "activation");
      await client.auth.activation.$post({
        json: {
          email: testUser.email,
          otp: activationOTP,
        },
      });

      const res = await client.auth.login.$post({
        json: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(res.status).toBe(200);
      // if (res.status === 200) {
      //   const data = await res.json();
      //   expect(data.success).toBe("Login successful");
      //   expect(data.message).toBe("Login successful");
      //   expect(data.data).toHaveProperty("access_token");
      //   accessToken = data.data.access_token;
      //   refreshTokenValue = data.data.refresh_token;
      // }
    }
  });

  //   it("should not login with incorrect password", async () => {
  //     await request(app).post("/register").send(testUser);

  //     const res = await request(app).post("/login").send({
  //       email: testUser.email,
  //       password: "wrongpassword",
  //     });

  //     expect(res.status).toBe(401);
  //     expect(res.body.message).toBe("Invalid email or password");
  //   });

  //   it("should not login if account is not activated", async () => {
  //     await request(app).post("/register").send(testUser);

  //     const res = await request(app).post("/login").send({
  //       email: testUser.email,
  //       password: testUser.password,
  //     });

  //     expect(res.status).toBe(401);
  //     expect(res.body.message).toBe("Account not active");
  //   });

  //   it("should send a password reset email", async () => {
  //     await request(app).post("/register").send(testUser);

  //     const res = await request(app).post("/reset-password").send({
  //       email: testUser.email,
  //     });

  //     expect(res.status).toBe(200);
  //     expect(res.body.message).toBe("Password reset mail sent");
  //   });

  //   it("should reset password with a valid OTP", async () => {
  //     await request(app).post("/register").send(testUser);

  //     // Get user from database
  //     const [user] = await db
  //       .select()
  //       .from(userTable)
  //       .where(eq(userTable.email, testUser.email));

  //     // Generate OTP manually (mocked)
  //     resetOTP = await generateOrReuseOTP(user.id, "reset-password");

  //     const res = await request(app).post("/reset-password-confirm").send({
  //       email: testUser.email,
  //       otp: resetOTP,
  //       new_password: "NewPassword123!",
  //     });

  //     expect(res.status).toBe(200);
  //     expect(res.body.message).toBe("Password reset successful");
  //   });

  //   it("should not reset password with an invalid OTP", async () => {
  //     await request(app).post("/register").send(testUser);

  //     const res = await request(app).post("/reset-password-confirm").send({
  //       email: testUser.email,
  //       otp: "wrong-otp",
  //       new_password: "NewPassword123!",
  //     });

  //     expect(res.status).toBe(400);
  //     expect(res.body.message).toBe("Invalid or expired otp");
  //   });

  //   it("should refresh token successfully", async () => {
  //     await request(app).post("/register").send(testUser);

  //     // Activate user
  //     const [user] = await db
  //       .select()
  //       .from(userTable)
  //       .where(eq(userTable.email, testUser.email));
  //     activationOTP = await generateOrReuseOTP(user.id, "activation");
  //     await request(app)
  //       .post("/activate")
  //       .send({ email: testUser.email, otp: activationOTP });

  //     // Login to get refresh token
  //     const loginRes = await request(app).post("/login").send({
  //       email: testUser.email,
  //       password: testUser.password,
  //     });

  //     refreshTokenValue = loginRes.body.data.refresh_token;

  //     const res = await request(app).post("/refresh-token").send({
  //       refresh_token: refreshTokenValue,
  //     });

  //     expect(res.status).toBe(200);
  //     expect(res.body.message).toBe("Token refresh successful");
  //     expect(res.body.data).toHaveProperty("access_token");
  //   });

  //   it("should not refresh token with invalid refresh token", async () => {
  //     const res = await request(app).post("/refresh-token").send({
  //       refresh_token: "invalid-token",
  //     });

  //     expect(res.status).toBe(401);
  //     expect(res.body.message).toBe("Unauthorized");
  //   });
});
