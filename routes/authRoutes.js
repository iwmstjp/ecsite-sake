const express = require("express");
const {
  createUserAndCart,
  loginUser,
} = require("../controllers/authController");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { req });
});

router.post("/login", loginUser);

router.get("/logout", (req, res) => {
  if (req.session.isAdmin) {
    req.session.isAdmin = false;
    res.redirect("/admin/login");
  } else {
    req.session.destroy();
    res.redirect("/");
  }
});

router.get("/signup", (req, res) => {
  res.render("signup", { req });
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    await createUserAndCart(username, password);
    res.redirect("/");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res
      .status(500)
      .send(
        err.message === "Username already exists"
          ? "Username already exists"
          : "Error creating user and cart"
      );
  }
});

module.exports = router;
