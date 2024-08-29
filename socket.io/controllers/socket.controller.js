const { redisClient } = require("../../client");
const { RedisError } = require("../../utils/RedisError.utils");
const { RedisSuccess } = require("../../utils/RedisSuccess.utils");
const {
  WinningTypes,
  LostType,
  WinningTypesReturn,
  LostTypeReturn,
} = require("../../constants");

const { randomUUID } = require("node:crypto");
const { Utility } = require("../../utils/Utility.utils");
const Game = require("../../models/game.model");
const Wallet = require("../../models/wallet.model");
const { isValidObjectId, default: mongoose } = require("mongoose");
const House = require("../../models/house.model");

const startGame = async (socket, id) => {
  try {
    console.log(socket.id, id);

    let gameId = randomUUID();

    // load user wallet
    let loadWallet = await Wallet.findOne({ user: id });

    if (!loadWallet) {
      socket.emit("ERROR", "WALLET NOT FOUND");
      return;
    }

    const playerObj = {
      id,
      socketId: socket.id,
      gameId,
      gameType: "", // from db of the slot machine
      // TODO: this data will come from redis as when the user login's the current balance must be inserted in the redis with user-${id}
      gameState: {
        principalBalanceBeforeBet: loadWallet.walletBalance || 9000,
        principalBalanceAfterBet: 0,
        betAmount: 0,
        wonAmount: 0,
        lostAmount: 0,
        previousGameState: "START",
        currentGameState: "STATE_GAME",
        combo: [],
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

    playerExists.gameState.previousGameState =
      playerExists.gameState.currentGameState;
    playerExists.gameState.currentGameState = "SET_BET_AMOUNT";

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
    console.log("isValidObjectId", isValidObjectId(id));

    let val1 = Utility.randomValueUpto7();
    let val2 = Utility.randomValueUpto7();
    let val3 = Utility.randomValueUpto7();

    console.log(val1, val2, val3);

    let houseState = await redisClient.get("house");

    if (!houseState)
      return new RedisError(false, "house redis client not found");

    houseState = JSON.parse(houseState);

    let userWon = false;

    // approcah first : taking winning_combination_array
    // WinningCombinationsEnum["1"].forEach(([v1, v2, v3]) => {
    //   if (v1 == val1 && v2 === val2 && v3 === val3) userWon = true
    // });

    // approach second

    //777 jackpot won
    if (val1 === val2 && val2 === val3 && val3 === 7)
      userWon = {
        win: true,
        winCombo: WinningTypes.jackpot,
        combo: [val1, val2, val3],
      };
    // 111,222,333... three of a kind won
    else if (val1 === val2 && val2 === val3)
      userWon = {
        win: true,
        winCombo: WinningTypes.threeOfKind,
        combo: [val1, val2, val3],
      };
    // TWO_OF_A_KIND :=>
    // else if (val1 == val2 || val2 == val3) userWon = true; // 112,211,221,122... two of a kind won with same combo adjcent
    // 112,211,221,122... two of a kind won with same combo not adjcent
    else if (val1 == val2 || val2 == val3 || val1 == val3)
      userWon = {
        win: true,
        winCombo: WinningTypes.twoOfKind,
        combo: [val1, val2, val3],
      };
    else
      userWon = {
        win: false,
        winCombo: LostType.lost,
        combo: [val1, val2, val3],
      };

    let player = await redisClient.get(`player-${id}`);

    player = JSON.parse(player);
    console.log("player in spin btn", player);

    if (userWon.win) {
      socket.emit("WON_LOOSE", userWon);

      if (userWon.winCombo === WinningTypes.jackpot) {
        player.gameState.wonAmount +=
          player.gameState.betAmount * WinningTypesReturn.jackpot;

        player.gameState.combo = userWon.combo;
      } else if (userWon.winCombo === WinningTypes.threeOfKind) {
        player.gameState.wonAmount +=
          player.gameState.betAmount * WinningTypesReturn.threeOfKind;

        player.gameState.combo = userWon.combo;
      } else if (userWon.winCombo === WinningTypes.twoOfKind) {
        player.gameState.wonAmount +=
          player.gameState.betAmount * WinningTypesReturn.twoOfKind;

        player.gameState.combo = userWon.combo;
      }

      houseState.houseState -= player.gameState.wonAmount;
      console.log("houseState in win", houseState);

      // update the current amounts and stuff
      let updatedWallet = await Wallet.findOne({
        user: new mongoose.Types.ObjectId(id),
      });

      console.log("updatedWallet", updatedWallet);

      if (!updatedWallet) return new RedisError(false, "wallet not found");

      updatedWallet.walletBalance =
        player.gameState.wonAmount + player.gameState.principalBalanceAfterBet;

      await updatedWallet.save();

      console.log("updatedWallet in won ", updatedWallet);
    } else {
      socket.emit("WON_LOOSE", userWon);
      // TODO :
      // do all the calculations and stuff for loosing with los-comb

      if (userWon.winCombo === LostType.lost) {
        player.gameState.lostAmount +=
          player.gameState.betAmount * LostTypeReturn.lost;

        player.gameState.combo = userWon.combo;
      }

      houseState.houseState += player.gameState.betAmount;
      console.log("houseState in lose", houseState);

      // update the current amounts and stuff
      let updatedWallet = await Wallet.findOne({
        user: new mongoose.Types.ObjectId(id),
      });

      console.log("updatedWallet", updatedWallet);

      if (!updatedWallet) return new RedisError(false, "wallet not found");

      updatedWallet.walletBalance =
        player.gameState.wonAmount + player.gameState.principalBalanceAfterBet;

      await updatedWallet.save();
    }

    await redisClient.set("house", JSON.stringify(houseState));

    let game = await Game.create({
      playerId: player.id,
      socketId: player.socketId,
      gameId: player.gameId,
      "gameState.principalBalance": player.gameState.principalBalanceBeforeBet,
      "gameState.currentBalance": player.gameState.principalBalanceAfterBet,
      "gameState.betAmount": player.gameState.betAmount,
      "gameState.wonAmount": player.gameState.wonAmount,
      "gameState.lostAmount": player.gameState.lostAmount,
      "gameState.combo": player.gameState.combo,
    });

    console.log("game", game);

    player.gameState.previousGameState = player.gameState.currentGameState;
    player.gameState.currentGameState = "PRESSED_SPIN_BUTTON";

    console.log(` before save player-${id}`, player);

    player = JSON.stringify(player);

    let redis = await redisClient.set(`player-${id}`, player);

    if (!redis) socket.emit("ERROR", "UNABLE TO SET BET AMOUNT");

    return new RedisSuccess(true, { val1, val2, val3 });
  } catch (error) {
    console.error("error occured during spin button ", error);

    return;
  }
};

const exitYes = async (socket, id) => {
  try {
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
    // TODO : return the game to previous state

    console.log("exitNo running");
    let r = await redisClient.get(`player-${id}`);
    console.log(r);

    if (!r) return new RedisError(false, "404", "player state not found");

    r = await JSON.parse(r);

    console.log(r);

    return new RedisSuccess(true, r.gameState);
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
