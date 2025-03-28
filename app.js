const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const port = 3000;
const app = express();

app.use(expressLayouts);
app.set("layout", "layouts/layout");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/", itemRoutes);
app.use("/", authRoutes);
app.use("/", cartRoutes);
app.use("/", paymentRoutes);
app.use("/", adminRoutes);
app.use("/", serviceRoutes);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
