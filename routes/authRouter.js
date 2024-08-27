const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshAccessToken,
  logout,
} = require("../controllers/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logout);

module.exports = router;
