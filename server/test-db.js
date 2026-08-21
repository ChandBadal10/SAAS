require("dotenv").config();

const { Client } = require("pg");

async function testDatabase() {
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("Connecting to PostgreSQL...");

    await client.connect();

    console.log("✅ PostgreSQL connection successful");

    const result = await client.query("SELECT NOW()");

    console.log("Database time:", result.rows[0]);

    await client.end();

    console.log("✅ Connection closed");
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error(error);
  }
}

testDatabase();