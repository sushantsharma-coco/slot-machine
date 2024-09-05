const express = require("express");
const router = express.Router();
const { wallet, addBalance } = require("../controllers/walletController.js");

router.route("/wallet/:id").post(wallet);
router.route("/addBalance").post(addBalance);

module.exports = { router };
