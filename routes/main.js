const express = require('express');
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
dotenv.config();
const router = express.Router();

// const { Client } = require("pg");
// const client = new Client({
//   user: process.env.USER,
//   host: process.env.HOST,
//   database: process.env.DATABASE_URL,
//   password: process.env.PASSWORD,
//   port: process.env.PORT,
// });
// client.connect();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/item', (req, res) => {
  res.render('item');
});

router.get('/cart', (req, res) => {
  res.render('cart');
});

router.get('/order', (req, res) => {
  res.render('order');
});

router.get('/success', (req, res) => {
  res.render('success');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) =>{
    const {username, password} = req.body;
    // const query = {
    //   text: "SELECT * FROM users WHERE username = $1 AND password = $2",
    //   values: [username, password],
    // };
    // client.query(query).then((res) => {
    //   console.log(res);
    // });
    res.redirect('/');
  });

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', async (req, res) => {
  const {username, password} = req.body;
  // const hashedPassword = await bcrypt.hash(password, 10);
  // const query = {
  //   text: "INSERT INTO users (username, password) VALUES ($1, $2)",
  //   values: [username, hashedPassword],
  // };
  // client.query(query).then((res) => {
  //   console.log(res);
  // });
  res.redirect('/');
});

module.exports = router;