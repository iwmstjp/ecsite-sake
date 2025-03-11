const { Client } = require("pg");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE_URL,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

client.connect();

const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash("admin", 10);
  const query = {
    text: "INSERT INTO adminuser (username, password, email, date_joined, permissions, is_active) VALUES ($1, $2, $3, $4, $5, $6)",
    values: [
      "admin",
      hashedPassword,
      "admin@example.com",
      new Date(),
      ["MANAGE_PRODUCTS", "MANAGE_USERS"],
      true,
    ],
  };
  await client.query(query);
};

module.exports = { client, createAdminUser };
