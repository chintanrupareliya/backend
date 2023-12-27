const express = require("express");
const authcontroller = require("../controllers/authcontroller");
const router = express.Router();
router.post("/signup", authcontroller.signup);
router.post("/login", authcontroller.login);
router.post("/refreshToken", authcontroller.refreshToken);
module.exports = router;
