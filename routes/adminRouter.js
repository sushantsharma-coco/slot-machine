const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getAllUsersWithGameStats,
  adminLogout,
} = require("../controllers/adminController.js");
const protect = require("../middlewares/adminMiddleware.js");

router.route("/login").post(adminLogin);
router.use(protect);
router.route("/dashboard").get(getAllUsersWithGameStats);
router.route("/logout").post(adminLogout);

module.exports = { router };
