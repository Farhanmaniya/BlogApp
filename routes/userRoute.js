const { Router } = require("express");
const { userSignup, userSignIn, userLogout } = require("../controllers/userController");
const router = Router();

router.post("/signup", userSignup);
router.post("/signin", userSignIn);
router.post("/logout", userLogout);

module.exports = router;