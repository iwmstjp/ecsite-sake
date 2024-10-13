const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './' });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: './' });
});

app.get('/register', (req, res) => {
  res.sendFile('register.html', { root: './' });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});