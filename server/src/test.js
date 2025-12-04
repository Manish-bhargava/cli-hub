// server/test-db.js
import "dotenv/config"; // Force load env vars immediately
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("-----------------------------------------");
  console.log("1. Checking Environment Variable...");
  
  // Mask the password for safety when logging
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ ERROR: DATABASE_URL is undefined!");
    process.exit(1);
  }
  console.log("✅ DATABASE_URL found:", url.split("@")[1]); // Show only the host part

  console.log("2. Attempting to connect to Prisma...");
  try {
    await prisma.$connect();
    console.log("✅ Connection Successful!");
    
    const count = await prisma.user.count(); // Assuming you have a User model
    console.log("✅ Can query database. User count:", count);
  } catch (e) {
    console.error("❌ Connection Failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
  console.log("-----------------------------------------");
}

main();