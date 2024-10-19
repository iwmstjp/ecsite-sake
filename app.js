const express = require('express');
const app = express();
const port = 3000;


app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/cart', (req, res) => {
  res.render('cart');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});