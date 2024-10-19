const express = require('express');
const app = express();
const port = 3000;


app.use(express.static('public'));
app.set('view engine', 'ejs');
const mainRouter = require('./routes/main');

app.use('/', mainRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});