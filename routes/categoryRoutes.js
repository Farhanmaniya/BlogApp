const { Router } = require("express");
const router = Router();
const { getCategories } = require("../controllers/blogController");

router.get("/", getCategories);

module.exports = router;
