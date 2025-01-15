import argon2 from "argon2";
import { db } from "./db";
import { users } from "./db/schema/users";

async function seedDatabase() {
  try {
    const adminPassword = "Niniola12"; // Replace with a secure password
    const hashedPassword = await argon2.hash(adminPassword);
    await db.insert(users).values({
      firstName: "Admin",
      lastName: "User",
      email: "admin.example.com",
      isActive: true,
      isAdmin: true,
      email_verified: true,
      password: hashedPassword,
    });
    console.log("Admin user created successfully!");
  } catch (error) {
    console.error("Error seeding the database:", error);
  }
}

seedDatabase()
  .then(() => {
    process.exit(0); // Exit the script
  })
  .catch((err) => {
    console.error("Error during seeding:", err);
    process.exit(1);
  });
