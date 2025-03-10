const express = require("express");
const { ensureAuthenticated } = require("../middleware/auth");
const {
  getCartDetails,
  checkCartItemExists,
  deleteCartItem,
  updateCartItem,
  addItemToCart,
  insertItemToCart,
} = require("../controllers/cartController");
const router = express.Router();

router.get("/cart", ensureAuthenticated, async (req, res) => {
  const { cartItemsWithItem, total } = await getCartDetails(req.session.cartId);
  res.render("cart", { req, cartItems: cartItemsWithItem, total });
});

router.post("/cart/delete", async (req, res) => {
  console.log("delete");
  const { itemId } = req.body;
  await deleteCartItem(req.session.cartId, itemId);
  res.redirect("/cart");
});

router.post("/cart", async (req, res) => {
  const { quantity, itemId } = req.body;
  if (quantity <= 0) {
    return res.status(400).send("Quantity must be greater than 0");
  }
  if (await checkCartItemExists(req.session.cartId, itemId)) {
    try {
      await addItemToCart(req.session.cartId, itemId, quantity);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).send("Error adding item to cart");
    }
  } else {
    try {
      await insertItemToCart(req.session.cartId, itemId, quantity);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).send("Error adding item to cart");
    }
  }
  res.redirect("/cart");
});

router.post("/cart/update", async (req, res) => {
  const { itemId, quantity } = req.body;
  await updateCartItem(req.session.cartId, itemId, quantity);
  res.redirect("/cart");
});

module.exports = router;
