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

    if (gamesData?.length) gamesData[0]["from"] = "redis";

    if (!gamesData?.length) {
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
        JSON.stringify(gamesData),
        "EX",
        150
      );

      gamesData[0]["from"] = "db";
    }

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          gamesData,
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

const gamesLeaderBoardData = async (req, res) => {
  try {
    if (!req.user?._id) throw new ApiError(401, "unauthroized user");

    let leaderBoardData = await redisClient.get("leaderboard");
    leaderBoardData = JSON.parse(leaderBoardData);

    if (!leaderBoardData?.length) {
      leaderBoardData = await Game.aggregate([
        {
          $group: {
            _id: "$playerId",
            totalGamesPlayed: {
              $sum: 1,
            },
            totalBetAmount: {
              $sum: "$gameState.betAmount",
            },
            totalWinAmount: {
              $sum: "$gameState.wonAmount",
            },
            totalLostAmount: {
              $sum: "$gameState.lostAmount",
            },
          },
        },
        {
          $sort: {
            totalWinAmount: -1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
          },
        },
        {
          $project: {
            totalGamesPlayed: 1,
            totalBetAmount: 1,
            totalWinAmount: 1,
            totalLostAmount: 1,
            "result.name": 1,
            "result.email": 1,
          },
        },
      ]);
    }

    await redisClient.set(
      "leaderboard",
      JSON.stringify(leaderBoardData),
      "EX",
      150
    );

    return res
      .status(200)
      .send(
        new ApiResponse(
          200,
          leaderBoardData,
          "leader board data fetched successfully"
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
  gamesLeaderBoardData,
};
