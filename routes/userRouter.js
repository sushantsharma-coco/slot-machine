const express = require("express");
const router = express.Router();
const wallet = require("../controllers/walletController.js");

router.route("/wallet/:id").post(wallet);

module.exports = { router };
