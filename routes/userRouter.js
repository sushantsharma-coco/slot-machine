const express = require("express");
const router = express.Router();
const wallet = require("../controllers/walletController.js");

router.post("/wallet/:id", wallet);

module.exports = router;
