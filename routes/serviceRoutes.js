const express = require("express");
const router = express.Router();
const {
  getTop10SakeId,
  getTop10Sake,
} = require("../controllers/serviceController");

router.get("/ranking", async (req, res) => {
  const [top10SakeId, rankDate] = await getTop10SakeId();
  const top10Sake = await getTop10Sake(top10SakeId);
  res.render("ranking", { req, top10Sake, rankDate });
});

module.exports = router;
