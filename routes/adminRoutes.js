const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { client } = require("../db/client");
const { fetchItems, fetchItemById } = require("../controllers/cartController");
const { ensureAuthenticated } = require("../middleware/auth");

router.get("/admin/login", (req, res) => {
  res.render("loginAdmin", { req });
});

router.post("/admin/login", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  try {
    const query = {
      text: "SELECT * FROM adminuser WHERE username = $1",
      values: [username],
    };
    const result = await client.query(query);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid username or password");
    }

    req.session.userId = user.id;
    req.session.isAdmin = true;
    const items = await fetchItems();

    res.render("adminDashboard", { req, items });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

router.get("/admin/dashboard", async (req, res) => {
  const items = await fetchItems();
  res.render("adminDashboard", { req, items });
});

router.get("/admin/add-item/", async (req, res) => {
  res.render("adminAddItem", { req });
});

router.post("/admin/add-item", async (req, res) => {
  const { name, price, description, image } = req.body;
  const query = {
    text: "INSERT INTO item (name, price, description, image) VALUES ($1, $2, $3, $4)",
    values: [name, price, description, image],
  };
  await client.query(query);
  res.redirect("/admin/dashboard");
});

router.get("/admin/edit-item/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  console.log(itemId);
  const item = await fetchItemById(itemId);
  res.render("adminEditItem", { req, item });
});

router.post("/admin/edit-item/:itemId", async (req, res) => {
  const { name, price, description, image } = req.body;
  const itemId = req.params.itemId;
  const query = {
    text: "UPDATE item SET name = $1, price = $2, description = $3, image = $4 WHERE id = $5",
    values: [name, price, description, image, itemId],
  };
  await client.query(query);
  res.redirect("/admin/dashboard");
});
module.exports = router;
