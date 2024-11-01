const express = require('express');
const dotenv = require("dotenv");
const bcrypt = require('bcrypt');
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

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', (req, res) =>{
    const {username, password} = req.body;
    const query = {
      text: "SELECT * FROM users WHERE username = $1 AND password = $2",
      values: [username, password],
    };
    client.query(query).then((res) => {
      console.log(res);
    });
    res.redirect('/');
  });

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const {username, password} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = {
    text: "INSERT INTO users (username, password) VALUES ($1, $2)",
    values: [username, hashedPassword],
  };
  client.query(query).then((res) => {
    console.log(res);
  });
  res.redirect('/');
});

module.exports = router;