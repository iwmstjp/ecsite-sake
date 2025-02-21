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

const checkCartItemExists = async (cartId, itemId) => {
    try {
      const result = await client.query(
        `SELECT 1 FROM Cart_CartItem WHERE cart_id = $1 AND cart_item_id = $2`,
        [cartId, itemId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error checking cart item existence:", error);
      throw error;
    }
};

router.post('/cart', async (req, res) => {
  const { quantity, itemId } = req.body;
  if (quantity <= 0) {
    return res.status(400).send('Quantity must be greater than 0');
  }
  console.log("cart id", req.session.cartId);
  console.log("item id", itemId);
  console.log("quantity", quantity);
  console.log(await checkCartItemExists(req.session.cartId, itemId));
  if (await checkCartItemExists(req.session.cartId, itemId)) {
  try { 
    const query = {
      text: `
      INSERT INTO Cart_CartItem (cart_id, cart_item_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, cart_item_id)
      DO UPDATE SET quantity = Cart_CartItem.quantity + $3
    `,
    values: [req.session.cartId, itemId, quantity],
  };
    await client.query(query);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).send('Error adding item to cart');
  }
  }
  else {
    try{
        const query = {
            text: `
            INSERT INTO Cart_CartItem (cart_id, cart_item_id, quantity)
            VALUES ($1, $2, $3)
            `,
            values: [req.session.cartId, itemId, quantity],
        };
        await client.query(query);
    }
    catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).send('Error adding item to cart');
    }
  }
  res.redirect('/cart');
});

module.exports = router;