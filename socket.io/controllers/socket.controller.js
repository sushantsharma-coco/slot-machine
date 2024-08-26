const { redisClient } = require("../../client");
const { RedisError } = require("../../utils/RedisError.utils");
const { RedisSuccess } = require("../../utils/RedisSuccess.utils");
const { WinningCombinationsEnum } = require("../../constants");

const { randomUUID } = require("node:crypto");
const { Utility } = require("../../utils/Utility.utils");

let bet;

const startGame = async (socket, id) => {
  try {
    console.log(socket.id, id);

    let gameId = randomUUID();
    playerExists = await redisClient.get(`player-${id}`);

    // TODO : get user account and balance data from redis with key: user-${id} as it must be present
    // if not return user with error, else move foward with init user state with data
    const playerObj = {
      id,
      socketId: socket.id,
      gameId,
      // TODO: this data will come from redis as when the user login's the current balance must be inserted in the redis with user-${id}
      gameState: {
        principalBalanceBeforeBet: 100,
        principalBalanceAfterBet: 0,
        betAmount: 0,
        wonAmount: 0,
        lostAmount: 0,
      },
    };

    console.log(playerObj);

    let result = await redisClient.set(
      `player-${id}`,
      JSON.stringify(playerObj)
    );

    if (!result) return new RedisError();

    socket.emit("MESSAGE", "NEW GAME INITIALIZED SUCCESSFULLY");

    return new RedisSuccess();
  } catch (error) {
    console.error("error occured during start game", error?.message);

    return;
  }
};

// const moneyInserted = async (socket, id) => {
//   try {
//     bet = await socket
//       .timeout(30000)
//       .emitWithAck(
//         "MESSAGE",
//         "PLEASE INSERT _$ BEFORE START PLAYING GAME, EMIT ON BET_AMOUNT"
//       );

//     console.log("bet", bet);

//     let playerExists = await redisClient.get(`player-${id}`);

//     if (!playerExists) {
//       return new RedisError(false, "player not found in redisClient");
//     }

//     playerExists = JSON.parse(playerExists);

//     // Initialize gameState if not already present
//     if (!playerExists.gameState) {
//       playerExists.gameState = { betAmount: 0 };
//     }

//     // Handle BET_AMOUNT event

//     if (bet) {
//       let result = await setBetAmount(socket, id, playerExists);

//       if (!result || result?.success === false) {
//         socket.emit("ERROR", result?.message);

//         return new RedisError();
//       }
//     }

//     return new RedisSuccess();
//   } catch (error) {
//     console.error("Error occurred during money inserted", error.message);

//     return;
//   }
// };

// const setBetAmount = async (socket, id, playerExists) => {
//   try {
//     console.log("setBetAmount running");

//     socket.on("BET_AMOUNT", async ({ betAmount }) => {
//       console.log(betAmount);

//       if (playerExists && playerExists.gameState) {
//         playerExists.gameState.betAmount = betAmount;

//         // Update the player object in Redis
//         result = await redisClient.set(
//           `player-${id}`,
//           JSON.stringify(playerExists)
//         );

//         if (!result)
//           return new RedisError(false, "unable to set the betting amount");
//       }

//       socket.emit("MESSAGE", "BETTING AMOUNT SET SUCCESSFULLY");

//       return new RedisSuccess();
//     });
//   } catch (error) {
//     console.error("error occured during setting bet amount", error?.message);

//     return;
//   }
// };

const setBetAmount = async (socket, id, betAmount) => {
  try {
    console.log("setBetAmount running");

    // check for player existance in redis-client which is must

    let playerExists = await redisClient.get(`player-${id}`);

    playerExists = JSON.parse(playerExists);

    if (!playerExists.id) return RedisError(false, "player not found");

    // check for sufficient balance in account for betAmount or else emit an error event with insufficient balance error message

    if (
      playerExists.gameState.principalBalanceAfterBet === undefined ||
      playerExists.gameState.principalBalanceAfterBet === null
    )
      return new RedisError(false, "no funds present");

    if (playerExists?.gameState?.principalBalanceBeforeBet - betAmount <= 0)
      return new RedisError(false, "insufficient funds");

    playerExists.gameState.principalBalanceAfterBet =
      playerExists.gameState.principalBalanceBeforeBet - betAmount;
    playerExists.gameState.betAmount = betAmount;

    console.log(playerExists);

    playerExists = JSON.stringify(playerExists);

    let redis = await redisClient.set(`player-${id}`, playerExists);

    if (!redis) {
      socket.emit("ERROR", "UNABLE TO SET BET AMOUNT");

      return new RedisError(false, "unable to set bet amount");
    }

    socket.emit("MESSAGE", "BETTING AMOUNT SET SUCCESSFULLY");

    return new RedisSuccess();
  } catch (error) {
    console.error(
      "error occured during setting betting amount :",
      error?.message
    );

    return;
  }
};

const pressedSpinButton = async (socket, id) => {
  try {
    console.log(WinningCombinationsEnum["1"]);

    let val1 = Utility.randomValueUpto7();
    let val2 = Utility.randomValueUpto7();
    let val3 = Utility.randomValueUpto7();

    console.log(val1, val2, val3);

    let userWon = false;

    // approcah first : taking winning_combination_array
    // WinningCombinationsEnum["1"].forEach(([v1, v2, v3]) => {
    //   if (v1 == val1 && v2 === val2 && v3 === val3) {
    //     userWon = true;
    //     console.log(
    //       "player won :",
    //       v1,
    //       v2,
    //       v3,
    //       " with com :",
    //       val1,
    //       val2,
    //       val3
    //     );
    //   } else {
    //     console.log(
    //       "player lost :",
    //       v1,
    //       v2,
    //       v3,
    //       " with com :",
    //       val1,
    //       val2,
    //       val3
    //     );
    //   }
    // });

    // approach second

    if (((val1 === val2) === val3) === 7) userWon = true; //777 jackpot won

    if ((val1 === val2) === val3) userWon = true; // 111,222,333... three of a kind won

    // if (val1 == val2 || val2 == val3) userWon = true; // 112,211,221,122... two of a kind won with same values adjcent

    if (val1 == val2 || val2 == val3 || val1 == val3) userWon = true; // 112,211,221,122... two of a kind won with same values not adjcent

    console.log(userWon);

    if (userWon) {
      socket.emit(
        "MESSAGE",
        `PLAYER WON WITH WINNING COMBINATION OF ${val1}, ${val2}, ${val3}`
      );

      // do all the calculations and operations for winning with certain win-comb
      // update the current amounts and stuff
    } else {
      socket.emit(
        "MESSAGE",
        `PLAYER LOST WITH COMBINATION OF ${(val1, val2, val3)}`
      );

      // do all the calculations and stuff for loosing with los-comb
      // update the current amounts and stuff
    }

    return new RedisSuccess(true, { val1, val2, val3 });
  } catch (error) {
    console.error("error occured during spin button ", error?.message);

    return;
  }
};

const exitYes = async (socket, id) => {
  try {
    // before deleting the state we need to check and store the current user state

    console.log("exitYes running");
    let r = await redisClient.del(`player-${id}`);

    if (!r) return new RedisError();

    return new RedisSuccess();
  } catch (error) {
    console.error("error occured during exit yes", error?.message);

    return;
  }
};

const exitNo = async (socket, id) => {
  try {
    console.log("exitNo running");
    let r = await redisClient.get(`player-${id}`);
    console.log(r);

    if (!r) return new RedisError(false, "404", "player state not found");

    r = await JSON.parse(r);

    console.log(r);

    return new RedisSuccess(true, r.gameState.playState);
  } catch (error) {
    console.error("error occured during exit no", error?.message);

    return;
  }
};

module.exports = {
  startGame,
  setBetAmount,
  pressedSpinButton,
  exitYes,
  exitNo,
};
