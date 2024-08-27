const express = require("express");
const router = express.Router();
const currentUser = require("../controllers/userController.js");
const wallet = require("../controllers/walletController.js");
const auth = require("../middlewares/authMiddleware");

router.post("/currentUser/:id", auth, currentUser);
router.post("/wallet/:id", wallet);

module.exports = router;
