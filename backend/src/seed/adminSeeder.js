import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../model/User.js";

const seedAdmin = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();

    // Skip seeding when an admin account already exists.
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(" Admin already exists:");
      console.log(`Name  : ${existingAdmin.name}`);
      console.log(`Email : ${existingAdmin.email}`);
      console.log("No changes made. Exiting...");
      process.exit(0);
    }

    // Seed default admin account.
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@finance.com",
      password: "Admin@1234", // pre-save hook will hash this automatically
      role: "admin",
      isActive: true,
    });

    // Seed default analyst account.
    const analyst = await User.create({
      name: "Finance Analyst",
      email: "analyst@finance.com",
      password: "Analyst@1234",
      role: "analyst",
      isActive: true,
    });

    // Seed default viewer account.
    const viewer = await User.create({
      name: "Dashboard Viewer",
      email: "viewer@finance.com",
      password: "Viewer@1234",
      role: "viewer",
      isActive: true,
    });

    console.log("\n Seeding completed successfully!\n");
    console.log("┌─────────────────────────────────────────────────┐");
    console.log("│              Seeded Users                       │");
    console.log("├──────────┬──────────────────────────┬───────────┤");
    console.log("│ Role     │ Email                    │ Password  │");
    console.log("├──────────┼──────────────────────────┼───────────┤");
    console.log(`│ admin    │ ${admin.email.padEnd(24)} │ Admin@1234  │`);
    console.log(`│ analyst  │ ${analyst.email.padEnd(24)} │ Analyst@1234│`);
    console.log(`│ viewer   │ ${viewer.email.padEnd(24)} │ Viewer@1234 │`);
    console.log("└──────────┴──────────────────────────┴───────────┘");
    console.log("\n Change these passwords after first login!\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
