const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
    socketId: {
      type: String,
      required: true,
      trim: true,
    },
    gameId: {
      type: String,
      required: true,
      trim: true,
    },
    gameState: {
      principalBalance: {
        type: Number,
        required: true,
      },
      currentBalance: {
        type: Number,
        required: true,
      },
      betAmount: {
        type: Number,
        required: true,
      },
      wonAmount: {
        type: Number,
        required: true,
      },
      lostAmount: {
        type: Number,
        required: true,
      },
      combo: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);
