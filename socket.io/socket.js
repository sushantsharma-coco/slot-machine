const app = require("express")();
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const {
  startGame,
  moneyInserted,
  pressedSpinButton,
  pressedPlayAgain,
  exitGame,
  setBetAmount,
} = require("./controllers/socket.controller");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

dotenv.config({ path: "./.env" });

io.on("connection", (socket) => {
  let { id } = socket.handshake.query;

  console.log(id, socket.id);

  socket.emit(
    "START",
    "PLEASE PRESS START OR EMIT START_GAME TO START THE GAME"
  );

  let gameState;

  socket.on("START_GAME", async () => {
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

    gameState = true;
  });

  if (gameState)
    socket.on("PRESSED_PLAY_AGAIN", () => {
      let result = pressedPlayAgain(socket);

      if (result.success === false) {
        gameState = false;
        return;
      }

      gameState = true;
    });

  if (gameState)
    socket.on("EXIT_GAME", () => {
      let result = exitGame(socket);

      if (result.success === false) {
        gameState = false;
        return;
      }

      gameState = true;
    });

  socket.on("disconnect", () => {
    console.log(`player with socket.id : ${socket.id} disconnected`);
    gameState = false;
  });
});

module.exports = { server, io, app };
