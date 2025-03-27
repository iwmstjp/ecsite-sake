const express = require("express");
const {
  getItems,
  getCartItems,
  deleteAllCartItems,
} = require("../controllers/cartController");
const { createOrder } = require("../controllers/paymentController");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

async function createPaymentSession(req, cartItems) {
  const items = await getItems(
    cartItems.map((item) => item.cart_item_id),
    req.session.cartId
  );
  if (cartItems.length === 0) {
    throw new Error("Cart is empty. Please add items to the cart.");
  }
  const cart_items = items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "JPY",
      unit_amount: parseInt(item.price),
      product_data: {
        name: item.name,
        description: item.description,
      },
    },
  }));

  const params = {
    line_items: cart_items,
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  };

  return await stripe.checkout.sessions.create(params);
}



router.post("/payment", async (req, res) => {
  try {
    const cartItems = await getCartItems(req.session.cartId);
    const session = await createPaymentSession(req, cartItems);
    await createOrder(req.session.userId, req.session.cartId);
    await deleteAllCartItems(req.session.cartId);
    res.redirect(session.url);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
router.get("/success", (req, res) => {
  res.render("success", { req });
});
router.get("/cancel", (req, res) => {
  res.render("cancel", { req });
});
module.exports = router;
