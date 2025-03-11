const { client } = require("../db/client");

const fetchItems = async () => {
  const query = {
    text: "SELECT * FROM item",
  };
  const result = await client.query(query);
  return result.rows;
};

const fetchItemById = async (itemId) => {
  const query = {
    text: "SELECT * FROM item WHERE id = $1",
    values: [itemId],
  };
  const result = await client.query(query);
  return result.rows[0];
};
const getCartItems = async (cartId) => {
  const query = {
    text: "SELECT * FROM Cart_CartItem WHERE cart_id = $1",
    values: [cartId],
  };
  const result = await client.query(query);
  return result.rows;
};

const getItem = async (itemId, cartId) => {
  const query = {
    text: `SELECT item.*, Cart_CartItem.quantity 
           FROM item 
           LEFT JOIN Cart_CartItem ON item.id = Cart_CartItem.cart_item_id 
           WHERE item.id = $1 AND Cart_CartItem.cart_id = $2`,
    values: [itemId, cartId],
  };
  const result = await client.query(query);
  return result.rows[0];
};

const getItems = async (itemIds, cartId) => {
  let items = [];
  for (const itemId of itemIds) {
    const item = await getItem(itemId, cartId);
    items.push(item);
  }
  return items;
};
const getCartDetails = async (cartId) => {
  const cartItems = await getCartItems(cartId);
  let total = 0;
  const cartItemsWithItem = await Promise.all(
    cartItems.map(async (item) => {
      const query = {
        text: "SELECT * FROM item WHERE id = $1",
        values: [item.cart_item_id],
      };
      const result = await client.query(query);
      total += result.rows[0].price * item.quantity;
      const cartItem = result.rows[0];
      return {
        ...cartItem,
        quantity: item.quantity,
        total: cartItem.price * item.quantity,
      };
    })
  );
  return { cartItemsWithItem, total };
};

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

const deleteCartItem = async (cartId, itemId) => {
  try {
    await client.query(
      `DELETE FROM Cart_CartItem WHERE cart_id = $1 AND cart_item_id = $2`,
      [cartId, itemId]
    );
  } catch (error) {
    console.error("Error deleting cart item:", error);
    throw error;
  }
};

const deleteAllCartItems = async (cartId) => {
  try {
    await client.query(`DELETE FROM Cart_CartItem WHERE cart_id = $1`, [
      cartId,
    ]);
  } catch (error) {
    console.error("Error deleting all cart items:", error);
    throw error;
  }
};

const updateCartItem = async (cartId, itemId, quantity) => {
  try {
    await client.query(
      `UPDATE Cart_CartItem SET quantity = $1 WHERE cart_id = $2 AND cart_item_id = $3`,
      [quantity, cartId, itemId]
    );
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

async function addItemToCart(cartId, itemId, quantity) {
  const query = {
    text: `
        INSERT INTO Cart_CartItem (cart_id, cart_item_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (cart_id, cart_item_id)
        DO UPDATE SET quantity = Cart_CartItem.quantity + $3
      `,
    values: [cartId, itemId, quantity],
  };
  await client.query(query);
}

async function insertItemToCart(cartId, itemId, quantity) {
  const query = {
    text: `
        INSERT INTO Cart_CartItem (cart_id, cart_item_id, quantity)
        VALUES ($1, $2, $3)
      `,
    values: [cartId, itemId, quantity],
  };
  await client.query(query);
}

module.exports = {
  getCartItems,
  getCartDetails,
  getItem,
  getItems,
  checkCartItemExists,
  deleteCartItem,
  deleteAllCartItems,
  updateCartItem,
  addItemToCart,
  insertItemToCart,
  fetchItems,
  fetchItemById,
};
