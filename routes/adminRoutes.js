const express = require("express");
const router = express.Router();
const { fetchItems, fetchItemById } = require("../controllers/cartController");
const {
  loginAdmin,
  insertItem,
  updateItem,
  logoutAdmin,
  deleteItem,
} = require("../controllers/adminController");
const { ensureAdmin } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/sake");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

router.get("/admin/login", (req, res) => {
  res.render("loginAdmin", { req, errorMessage: null });
});

router.post("/admin/login", async (req, res) => {
  await loginAdmin(req, res);
});

router.get("/admin/logout", async (req, res) => {
  await logoutAdmin(req, res);
  res.redirect("/admin/login");
});

router.get("/admin/dashboard", ensureAdmin, async (req, res) => {
  const items = await fetchItems();
  res.render("adminDashboard", { req, items });
});

router.get("/admin/add-item", ensureAdmin, async (req, res) => {
  res.render("adminAddItem", { req });
});

router.post("/admin/add-item", ensureAdmin, upload.single("file"), async (req, res) => {
  const { name, price, description } = req.body;
  const file = req.file;
  const imageName = file.filename;
  await insertItem(name, price, description, imageName);
  res.redirect("/admin/dashboard");
});

router.get("/admin/edit-item/:itemId", ensureAdmin, async (req, res) => {
  const itemId = req.params.itemId;
  const item = await fetchItemById(itemId);
  res.render("adminEditItem", { req, item });
});

router.post(
  "/admin/edit-item/:itemId",
  ensureAdmin,
  upload.single("file"),
  async (req, res) => {
    const itemId = req.params.itemId;
    const { name, price, description } = req.body;
    const file = req.file;
    let imageName;
    const existingItem = await fetchItemById(itemId);
    if (file) {
      imageName = file.filename;
    } else {
      imageName = existingItem.image;
    }

    await updateItem(name, price, description, imageName, itemId);
    res.redirect("/admin/dashboard");
  }
);

router.post("/admin/delete-item/:itemId", ensureAdmin, async (req, res) => {
  const itemId = req.params.itemId;
  console.log("deleteItem:", itemId);
  await deleteItem(itemId);
  res.redirect("/admin/dashboard");
});

module.exports = router;
