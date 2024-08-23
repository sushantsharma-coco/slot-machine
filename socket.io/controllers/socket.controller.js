const { redisClient } = require("../../client");
const { RedisError } = require("../../utils/RedisError.utils");
const { RedisSuccess } = require("../../utils/RedisSuccess.utils");

const { randomUUID } = require("node:crypto");

const startGame = async (socket, id) => {
  try {
    console.log(socket.id, id);

    let gameId = randomUUID();
    playerExists = await redisClient.get(`player-${id}`);

    if (playerExists?.length)
      return new RedisError(false, "user already exists in redisClient");

    const playerObj = {
      id,
      socketId: socket.id,
      gameId,
      gameState: {
        betAmount: 0,
      },
    };

    console.log(playerObj);

    let result = await redisClient.set(
      `player-${id}`,
      JSON.stringify(playerObj)
    );

    if (!result) return new RedisError();

    return new RedisSuccess();
  } catch (error) {
    console.error("error occured during start game", error?.message);

    return;
  }
};

const moneyInserted = async (socket, id) => {
  try {
    socket.emit(
      "MESSAGE",
      "PLEASE INSERT _$ BEFORE START PLAYING GAME, EMIT ON BET_AMOUNT"
    );

    let playerExists = await redisClient.get(`player-${id}`);

    if (!playerExists) {
      return new RedisError(false, "player not found in redisClient");
    }

    playerExists = JSON.parse(playerExists);

    // Initialize gameState if not already present
    if (!playerExists.gameState) {
      playerExists.gameState = { betAmount: 0 };
    }

    // Handle BET_AMOUNT event
    socket.on("BET_AMOUNT", async ({ betAmount }) => {
      if (playerExists && playerExists.gameState) {
        playerExists.gameState.betAmount = betAmount;

        // Update the player object in Redis
        result = await redisClient.set(
          `player-${id}`,
          JSON.stringify(playerExists)
        );

        if (!result)
          return new RedisError(false, "unable to set the betting amount");
      }

      socket.emit("MESSAGE", "BETTING AMOUNT SET SUCCESSFULLY");
    });

    return new RedisSuccess();
  } catch (error) {
    console.error("Error occurred during money inserted", error.message);

    return;
  }
};

const pressedSpinButton = async () => {
  try {
  } catch (error) {
    console.error("error occured during spin button ", error?.message);

    return;
  }
};
const pressedPlayAgain = async () => {
  try {
  } catch (error) {
    console.error("error occured during play again", error?.message);

    return;
  }
};

const exitGame = async () => {
  try {
  } catch (error) {
    console.error("error occured during exit game", error?.message);

    return;
  }
};

module.exports = {
  startGame,
  exitGame,
  moneyInserted,
  pressedSpinButton,
  pressedPlayAgain,
};
