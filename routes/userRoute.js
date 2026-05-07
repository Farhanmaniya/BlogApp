const { Router } = require("express");
const { userSignup, userSignIn } = require("../controllers/userController");
const router = Router();

router.post("/signup", userSignup);
router.post("/signin", userSignIn);

module.exports = router;