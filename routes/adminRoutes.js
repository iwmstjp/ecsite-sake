const express = require("express");
const router = express.Router();
const { fetchItems, fetchItemById } = require("../controllers/cartController");
const {
  loginAdmin,
  insertItem,
  updateItem,
} = require("../controllers/adminController");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/sake');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

router.get("/admin/login", (req, res) => {
  res.render("loginAdmin", { req, errorMessage: null });
});

router.post("/admin/login", async (req, res) => {
  await loginAdmin(req, res);
});


router.get("/admin/dashboard", async (req, res) => {
  const items = await fetchItems();
  res.render("adminDashboard", { req, items });
});

router.get("/admin/add-item/", async (req, res) => {
  res.render("adminAddItem", { req });
});

router.post("/admin/add-item", upload.single('file'), async (req, res) => {
  const { name, price, description } = req.body;
  const file = req.file;
  const imageName = file.filename;
  await insertItem(name, price, description, imageName);
  res.redirect("/admin/dashboard");
});

router.get("/admin/edit-item/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  const item = await fetchItemById(itemId);
  res.render("adminEditItem", { req, item });
});

router.post("/admin/edit-item/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  await updateItem(req.body, itemId);
  res.redirect("/admin/dashboard");
});

module.exports = router;
