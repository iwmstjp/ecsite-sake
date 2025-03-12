const express = require("express");
const {
  createUserAndCart,
  loginUser,
  rollbackTransaction,
  getUserOrders,
  getOrderDetailsById,
} = require("../controllers/authController");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { req, errorMessage: null });
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
  res.render("signup", { req, errorMessage: null });
});

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    await createUserAndCart(username, password);
    res.redirect("/");
  } catch (err) {
    await rollbackTransaction();
    console.error(err);
    res.render("signup", {
      req,
      errorMessage:
        err.message === "Username already exists"
          ? "Username already exists"
          : "Error creating user",
    });
  }
});

router.get("/profile", async (req, res) => {
  const userId = req.session.userId;
  const orders = await getUserOrders(userId);
  res.render("profile", { req, orders });
});

router.get("/profile/order/:id", async (req, res) => {
  const orderId = req.params.id;
  const order = await getOrderDetailsById(orderId);
  res.render("order", { req, order });
});

module.exports = router;
