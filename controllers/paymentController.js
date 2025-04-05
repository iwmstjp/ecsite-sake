const { client } = require("../db/client");
const { getCartDetails, getCartItems } = require("./cartController");

async function createOrder(userId, cartId) {
  const cartDetails = await getCartDetails(cartId);
  const cartItems = await getCartItems(cartId);
  console.log("cartDetails---");
  console.log(cartDetails);
  console.log("cartItems---");
  console.log(cartItems);

  await client.query("BEGIN");
  try {
    const result = await client.query(
      "INSERT INTO Orders (user_id, order_price) VALUES ($1, $2) RETURNING id",
      [userId, cartDetails.total]
    );
    const orderId = result.rows[0].id;
    cartItems.forEach(async (item) => {
      await client.query(
        "INSERT INTO Orders_OrderItem (order_id, cart_item_id, quantity) VALUES ($1, $2, $3)",
        [orderId, item.cart_item_id, item.quantity]
      );
    });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

module.exports = {
  createOrder,
};
