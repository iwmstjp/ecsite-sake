const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const port = 3000;

// EJSレイアウト設定
app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
const mainRouter = require('./routes/main');

app.use('/', mainRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});