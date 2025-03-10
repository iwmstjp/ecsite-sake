const express = require("express");
const bcrypt = require("bcrypt");
const { client } = require("../db/client");
const router = express.Router();

router.get("/admin/login", (req, res) => {
  res.render("login", { req });
});

router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const query = {
      text: "SELECT * FROM admin WHERE username = $1",
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
    req.session.cartId = user.cart;

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});
