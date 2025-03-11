const express = require("express");
const { fetchItems, fetchItemById } = require("../controllers/cartController");
const router = express.Router();

router.get("/", async (req, res) => {
  const items = await fetchItems();
  res.render("index", { req, items });
});

router.post("/item/:itemId", async (req, res) => {
  const { itemId } = req.body;
  const item = await fetchItemById(itemId);
  res.render("item", { req, item });
});

module.exports = router;
