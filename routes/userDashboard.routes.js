const {
  userAggregatedGamingData,
} = require("../controllers/userDashboard.controller");
const auth = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.use(auth);
router.route("/gaming-data").get(userAggregatedGamingData);

module.exports = {
  router,
};
