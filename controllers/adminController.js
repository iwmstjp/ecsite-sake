const { client } = require("../db/client");
const bcrypt = require("bcrypt");

async function loginAdmin(req, res) {
  const { username, password } = req.body;
  try {
    const query = {
      text: "SELECT * FROM adminuser WHERE username = $1",
      values: [username],
    };
    const result = await client.query(query);
    const user = result.rows[0];

    if (!user) {
      return res.render("loginAdmin", {
        req,
        errorMessage: "Invalid username or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("loginAdmin", {
        req,
        errorMessage: "Invalid username or password",
      });
    }

    req.session.userId = user.id;
    req.session.isAdmin = true;

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.render("loginAdmin", {
      req,
      errorMessage: "Error logging in",
    });
  }
}

async function logoutAdmin(req, res) {
  req.session.destroy();
}

const insertItem = async (name, price, description, image) => {
  const query = {
    text: "INSERT INTO item (name, price, description, image) VALUES ($1, $2, $3, $4)",
    values: [name, price, description, image],
  };
  await client.query(query);
};

async function updateItem(name, price, description, image, itemId) {
  const query = {
    text: "UPDATE item SET name = $1, price = $2, description = $3, image = $4 WHERE id = $5",
    values: [name, price, description, image, itemId],
  };
  await client.query(query);
}

async function deleteItem(itemId) {
  const query = {
    text: "DELETE FROM item WHERE id = $1",
    values: [itemId],
  };
  await client.query(query);
}
module.exports = {
  insertItem,
  loginAdmin,
  updateItem,
  logoutAdmin,
  deleteItem,
};
