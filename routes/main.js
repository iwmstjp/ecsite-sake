const express = require('express');
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
dotenv.config();
const router = express.Router();

const { Client } = require("pg");
const client = new Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE_URL,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});
client.connect();

router.use(expressLayouts);
router.use((req, res, next) => {
  res.locals.layout = 'layouts/layout';
  next();
});
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 認証ミドルウェア
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.status(401).send('You need to log in to access this page');
  }
}

router.get('/', async (req, res) => {
  const query = {
    text: "SELECT * FROM item",
  };
  const result = await client.query(query);
  const items = result.rows;
  res.render('index', { req, items });
});

router.get('/item', (req, res) => {
  res.render('item', { req });
});

router.post('/item', async (req, res) => {
  const { itemId } = req.body;
  const query = {
    text: "SELECT * FROM item WHERE id = $1",
    values: [itemId],
  };
  const result = await client.query(query);
  res.render('item', { req, item: result.rows[0] });
});

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

router.get('/order', (req, res) => {
  res.render('order', { req });
});

router.get('/success', (req, res) => {
  res.render('success', { req });
});

router.get('/login', (req, res) => {
  res.render('login', { req });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  try {
    const query = {
      text: "SELECT * FROM customuser WHERE username = $1",
      values: [username],
    };
    const result = await client.query(query);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).send('Invalid username or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Invalid username or password');
    }

    req.session.userId = user.id;
    req.session.cartId = user.cart;

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/signup', (req, res) => {
  res.render('signup', { req });
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  try {
    // Check if the username already exists
    const userCheckQuery = {
      text: "SELECT id FROM customuser WHERE username = $1",
      values: [username],
    };
    const userCheckResult = await client.query(userCheckQuery);

    if (userCheckResult.rows.length > 0) {
      // Username already exists
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Begin transaction
    await client.query('BEGIN');

    // Insert a new cart and get its ID
    const cartResult = await client.query('INSERT INTO cart DEFAULT VALUES RETURNING id');
    const cartId = cartResult.rows[0].id;

    // Insert a new user with the cart ID
    const userQuery = {
      text: "INSERT INTO customuser (username, password, is_staff, date_joined, cart) VALUES ($1, $2, $3, $4, $5)",
      values: [username, hashedPassword, false, new Date(), cartId],
    };
    await client.query(userQuery);

    // Commit transaction
    await client.query('COMMIT');

    res.redirect('/');
  } catch (err) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Error creating user and cart');
  }
});

module.exports = router;