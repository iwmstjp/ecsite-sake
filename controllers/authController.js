const { client } = require("../db/client");

async function getUserByUsername(username) {
  const query = {
    text: "SELECT * FROM customuser WHERE username = $1",
    values: [username],
  };
  const result = await client.query(query);
  return result.rows[0];
}

async function createUser(username, hashedPassword, cartId) {
  const userQuery = {
    text: "INSERT INTO customuser (username, password, is_staff, date_joined, cart) VALUES ($1, $2, $3, $4, $5)",
    values: [username, hashedPassword, false, new Date(), cartId],
  };
  await client.query(userQuery);
}

async function createAdminUser(username, hashedPassword, email, permissions) {
  const adminQuery = {
    text: "INSERT INTO AdminUser (username, password, email, permissions) VALUES ($1, $2, $3, $4)",
    values: [username, hashedPassword, email, permissions],
  };
  await client.query(adminQuery);
}

module.exports = { getUserByUsername, createUser, createAdminUser };
