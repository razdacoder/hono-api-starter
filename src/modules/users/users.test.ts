import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { userTable } from "@/db/schema/users";
import env from "@/env";
import createApp from "@/lib/create-app";
import { generateOrReuseOTP } from "@/lib/encryption";
import authRouter from "@/modules/auth/auth.index";

import router from "./users.index";
import { getUserByEmail } from "./users.services";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/users", router));
const authClient = testClient(createApp().route("/auth", authRouter));

const testUser = {
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  password: "Password123!",
};

let access_token: string;
let user_id: string;

describe("user Routes", () => {
  beforeAll(async () => {
    execSync("pnpm db:generate");
    execSync("pnpm db:migrate");

    // Create New User
    await authClient.auth.register.$post({
      json: testUser,
    });

    // Get user from database
    const user = await getUserByEmail({
      email: testUser.email,
      withPassword: false,
    });
    if (user) {
      // Activate User
      const activationOTP = await generateOrReuseOTP(user.id, "activation");
      await authClient.auth.activation.$post({
        json: {
          email: testUser.email,
          otp: activationOTP,
        },
      });

      const res = await authClient.auth.login.$post({
        json: {
          email: user.email,
          password: testUser.password,
        },
      });
      const data = await res.json();
      access_token = data.data.access_token;
      user_id = data.data.user.id;
    }
  });

  afterAll(async () => {
    // Clean up database after all tests
    await db.delete(userTable);
  });

  it("should return the current user", async () => {
    const res = await client.users.me.$get(undefined, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.email).toBe(testUser.email);
    expect(json.data.id).toBe(user_id);
  });

  //   it("should list users with pagination", async () => {
  //     const res = await client.users.$get(
  //       {
  //         query: { page: 1, limit: 10 },
  //       },
  //       { headers: { Authorization: `Bearer ${access_token}` } }
  //     );

  //     expect(res.status).toBe(200);
  //     const json = await res.json();
  //     expect(json.success).toBe(true);
  //     expect(json.data.items.length).toBeGreaterThan(0);
  //   });

  it("should fetch a user by ID", async () => {
    const res = await client.users[":id"].$get(
      {
        param: { id: user_id },
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("User retrieve successfully");
  });

  it("should update the current user", async () => {
    const updateData = { firstName: "Updated", lastName: "User" };

    const res = await client.users.me.$patch(
      {
        json: updateData,
      },
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.firstName).toBe("Updated");
  });

  it("should not delete user with wrong password", async () => {
    const res = await client.users.me.$delete(
      { json: { current_password: "wrong_pass" } },
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe("Invalid password");
  });

  it("should change user password", async () => {
    const res = await client.users["change-password"].$post(
      {
        json: {
          current_password: testUser.password,
          new_password: "newPassword456",
          confirm_new_password: "newPassword456",
        },
      },
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("Password updated successfully");
  });
});
