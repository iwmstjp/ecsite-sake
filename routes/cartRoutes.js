const express = require('express');
const { client } = require('../db/client');
const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/cart', ensureAuthenticated, async (req, res) => {
  const query = {
    text: "SELECT * FROM Cart_CartItem WHERE cart_id = $1",
    values: [req.session.cartId],
  };
  const result = await client.query(query);
  const cartItems = result.rows;
  const cartItemsWithItem = await Promise.all(cartItems.map(async (item) => {
    const query2 = {
      text: "SELECT * FROM item WHERE id = $1",
      values: [item.cart_item_id],
    };
    const result2 = await client.query(query2);
    const cartItem = result2.rows[0];
    return {
      ...cartItem,
      quantity: item.quantity,
      total: cartItem.price * item.quantity,
    };
  }));
  res.render('cart', { req, cartItems: cartItemsWithItem });
});

router.post('/cart', async (req, res) => {
  const { itemId, quantity } = req.body;
  if (quantity <= 0) {
    return res.status(400).send('Quantity must be greater than 0');
  }
  const query = {
    text: "INSERT INTO Cart_CartItem (cart_id, cart_item_id) VALUES ($1, $2)",
    values: [req.session.cartId, itemId],
  };
  await client.query(query);
  res.redirect('/cart');
});

module.exports = router;