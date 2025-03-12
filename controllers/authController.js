const { client } = require("../db/client");
const bcrypt = require("bcrypt");

async function rollbackTransaction() {
  await client.query("ROLLBACK");
}
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

async function validateUser(username, password) {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error("Invalid username or password");
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Invalid username or password");
  }
  return user;
}

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await validateUser(username, password);
    req.session.userId = user.id;
    req.session.cartId = user.cart;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.render("login", {
      req,
      errorMessage: err.message,
    });
  }
};

const getUserOrders = async (userId) => {
  const query = {
    text: `
      SELECT * FROM Orders 
      WHERE user_id = $1
    `,
    values: [userId],
  };
  const result = await client.query(query);
  return result.rows;
};

const getOrderDetailsById = async (orderId) => {
  const query = {
    text: `
      SELECT 
        i.name, 
        i.price, 
        oi.cart_item_id, 
        oi.quantity,
        o.ordered_date
      FROM Orders o
      JOIN Orders_OrderItem oi ON o.id = oi.order_id
      JOIN Item i ON oi.cart_item_id = i.id
      WHERE o.id = $1
    `,
    values: [orderId],
  };
  const result = await client.query(query);
  return result.rows;
};
module.exports = {
  getUserByUsername,
  createUser,
  createAdminUser,
  createUserAndCart,
  loginUser,
  rollbackTransaction,
  getUserOrders,
  getOrderDetailsById,
};
