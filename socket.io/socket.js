const app = require("express")();
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const {
  startGame,
  setBetAmount,
  pressedSpinButton,
  exitYes,
  exitNo,
} = require("./controllers/socket.controller");
const { checkAuthentic } = require("./middlewares/auth.controller");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

dotenv.config({ path: "./.env" });

io.on("connection", async (socket) => {
  // TODO :: USER AUTHENTICATION MUST BE DONE HERE BEFORE THE SOCKET CAN EMIT START

  let authResult = await checkAuthentic(socket);

  console.log("authResult", authResult);

  let { id } = socket.handshake.query;

  // TODO : if auth unsuccessful the user can not proceed with the game and socket event won't be emmited

  if (authResult?.success === false) return;

  // TODO : if auth successful then only the user proceeds with the game and socket event will be emmited

  socket.emit(
    "START",
    "PLEASE PRESS START OR EMIT START_GAME TO START THE GAME"
  );

  let gameState = "START_GAME";

  socket.on("START_GAME", async () => {
    if (gameState !== "START_GAME") return;

    let result = await startGame(socket, id);

    if (result?.success === false) {
      gameState = false;

      socket.emit("ERROR", result.error);

      return;
    }

    console.log(result);
    socket.emit("MESSAGE", "EMIT  ON SET_BET_AMOUNT WITH _$ BETTING AMOUNT");
    gameState = "SET_BET_AMOUNT";
  });

  socket.on("SET_BET_AMOUNT", async ({ betAmount }) => {
    if (gameState !== "SET_BET_AMOUNT") return;

    if (typeof betAmount !== "number") return;

    let result = await setBetAmount(socket, id, betAmount);

    if (result?.success === false) {
      gameState = false;

      socket.emit("ERROR", result.error);

      return;
    }

    socket.emit(
      "MESSAGE",
      "EMIT SOCKET ON PRESSED_SPIN_BUTTON TO PLAY THE GAME"
    );
    gameState = "PRESSED_SPIN_BUTTON";
  });

  socket.on("PRESSED_SPIN_BUTTON", () => {
    if (gameState !== "PRESSED_SPIN_BUTTON") return;

    let result = pressedSpinButton(socket);

    if (result.success === false) {
      gameState = false;
      return;
    }

    socket.emit(
      "MESSAGE",
      "EMIT ON 'X' WITH PRESSED_PLAY_AGAIN TO PLAY AGAIN AND EXIT_GAME TO EXIT GAME"
    );

    socket.timeout(10000).on("X", ({ x }) => {
      gameState = x;

      console.log(gameState);

      socket.emit("MESSAGE", `EMIT ON ${gameState}`);
    });
  });

  socket.on("PRESSED_PLAY_AGAIN", () => {
    if (gameState !== "PRESSED_PLAY_AGAIN") return;

    socket.emit(
      "MESSAGE",
      "WANT TO PLAY WITH SAME BET AMOUNT OR SET NEW AMOUNT ? EMIT ON START_GAME"
    );

    gameState = "START_GAME";
  });

  socket.on("EXIT_GAME", async () => {
    socket.emit(
      "MESSAGE",
      "ARE YOU SURE YOU WANT TO EXIT ?!!!! EMIT ON EXIT_YES ELSE EXIT_NO "
    );

    gameState = "EXIT_GAME";
  });

  socket.on("EXIT_YES", async () => {
    if (gameState !== "EXIT_GAME") return;

    let result = await exitYes(socket, id);

    if (result?.success === false) {
      socket.emit("ERROR", "UNABLE TO EXIT_GAME");

      socket.emit(
        "MESSAGE",
        "RE-EMIT ON EXIT_YES AFTER SOMETIME TO EXIT GAME OR EXIT_NO TO NOT EXIT_GAME"
      );
      return;
    }

    gameState = "START_GAME";

    if (result?.success) socket.emit("MESSAGE", "GAME EXITTED SUCCESSFULLY");
  });

  socket.on("EXIT_NO", async () => {
    if (gameState !== "EXIT_GAME") return;

    let result = await exitNo(socket, id);

    if (!result || result.success === false) return;

    gameState = result.message;
    console.log(result.message);
    console.log(gameState);

    socket.emit("MESSAGE", "EXIT GAME CANCELLED SUCCESSFULLY");
  });

  socket.on("disconnect", () => {
    console.log(`player with socket.id : ${socket.id} disconnected`);
    gameState = false;
  });
});

module.exports = { server, io, app };
