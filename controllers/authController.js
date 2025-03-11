const { client } = require("../db/client");
const bcrypt = require("bcrypt");
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

const createUserAndCart = async (username, password) => {
  const userCheckQuery = {
    text: "SELECT id FROM customuser WHERE username = $1",
    values: [username],
  };
  const userCheckResult = await client.query(userCheckQuery);

  if (userCheckResult.rows.length > 0) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await client.query("BEGIN");

  const cartResult = await client.query(
    "INSERT INTO cart DEFAULT VALUES RETURNING id"
  );
  const cartId = cartResult.rows[0].id;

  await createUser(username, hashedPassword, cartId);

  await client.query("COMMIT");
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid username or password");
    }

    req.session.userId = user.id;
    req.session.cartId = user.cart;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
};

module.exports = {
  getUserByUsername,
  createUser,
  createAdminUser,
  createUserAndCart,
  loginUser,
};
