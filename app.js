// const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
// const app = express();
// const port = 3000;

// // EJSレイアウト設定
// app.use(expressLayouts);
// app.set('layout', 'layouts/layout');
// app.set('view engine', 'ejs');

// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
// const mainRouter = require('./routes/main');

// app.use('/', mainRouter);

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const port = 3000;
const app = express();

app.use(expressLayouts);
app.set('layout', 'layouts/layout');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', itemRoutes);
app.use('/', authRoutes);
app.use('/', cartRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});