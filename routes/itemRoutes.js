const express = require('express');
const { client } = require('../db/client');
const router = express.Router();

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

module.exports = router;