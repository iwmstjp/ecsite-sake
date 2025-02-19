const express = require('express');
const bcrypt = require('bcrypt');
const { client } = require('../db/client');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { req });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
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
  try {
    const userCheckQuery = {
      text: "SELECT id FROM customuser WHERE username = $1",
      values: [username],
    };
    const userCheckResult = await client.query(userCheckQuery);

    if (userCheckResult.rows.length > 0) {
      return res.status(400).send('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    const cartResult = await client.query('INSERT INTO cart DEFAULT VALUES RETURNING id');
    const cartId = cartResult.rows[0].id;

    const userQuery = {
      text: "INSERT INTO customuser (username, password, is_staff, date_joined, cart) VALUES ($1, $2, $3, $4, $5)",
      values: [username, hashedPassword, false, new Date(), cartId],
    };
    await client.query(userQuery);

    await client.query('COMMIT');

    res.redirect('/');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Error creating user and cart');
  }
});

module.exports = router;