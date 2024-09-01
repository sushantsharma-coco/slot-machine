const {
  userAggregatedGamingData,
  gamesLeaderBoardData,
} = require("../controllers/userDashboard.controller");
const auth = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.use(auth);
router.route("/gaming-data").get(userAggregatedGamingData);
router.route("/leaderboard").get(gamesLeaderBoardData);

module.exports = {
  router,
};
