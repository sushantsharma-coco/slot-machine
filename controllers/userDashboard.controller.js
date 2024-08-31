const { ApiError } = require("../utils/ApiError.utils");
const { ApiResponse } = require("../utils/ApiResponse.utils");
const Game = require("../models/game.model");
const { redisClient } = require("../client");
const mongoose = require("mongoose");

const userAggregatedGamingData = async (req, res) => {
  try {
    if (!req.user || !req.user?._id)
      throw new ApiError(401, "unauthorized user");

    let gamesData = await redisClient.get(`gamesData-${req.user?._id}`);
    gamesData = JSON.parse(gamesData);

    if (!gamesData?._id) {
      gamesData = await Game.aggregate([
        {
          $match: {
            playerId: new mongoose.Types.ObjectId(req.user?._id),
          },
        },
        {
          $group: {
            _id: "$playerId",
            totalAmountBeted: {
              $sum: "$gameState.betAmount",
            },
            totalAmountWon: {
              $sum: "$gameState.wonAmount",
            },
            totalAmountLost: {
              $sum: "$gameState.lostAmount",
            },
          },
        },
      ]);

      await redisClient.set(
        `gamesData-${req.user?._id}`,
        JSON.stringify(gamesData)
      );
    }

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { d: gamesData[0], p: "db" },
          "user aggregated data fetched successfully"
        )
      );
  } catch (error) {
    console.error("error occured :", error?.message);

    return res
      .status(error?.statusCode)
      .send(
        new ApiError(
          error?.statusCode || 500,
          error?.message || "internal server error"
        )
      );
  }
};

module.exports = {
  userAggregatedGamingData,
};
