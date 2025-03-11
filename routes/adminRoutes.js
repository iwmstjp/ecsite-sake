const express = require("express");
const router = express.Router();
const { fetchItems, fetchItemById } = require("../controllers/cartController");
const {
  loginAdmin,
  insertItem,
  updateItem,
} = require("../controllers/adminController");

router.get("/admin/login", (req, res) => {
  res.render("loginAdmin", { req });
});

router.post("/admin/login", async (req, res) => {
  await loginAdmin(req, res);
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
  await insertItem(name, price, description, image);
  res.redirect("/admin/dashboard");
});

router.get("/admin/edit-item/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  const item = await fetchItemById(itemId);
  res.render("adminEditItem", { req, item });
});

router.post("/admin/edit-item/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  await updateItem(req.body, itemId);
  res.redirect("/admin/dashboard");
});

module.exports = router;
