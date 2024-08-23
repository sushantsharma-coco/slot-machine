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
} = require("./controllers/socket.controller");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

dotenv.config({ path: "./.env" });

io.on("connection", (socket) => {
  let { id } = socket.handshake.query;
  console.log(id);

  socket.emit(
    "START",
    "PLEASE PRESS START OR EMIT START_GAME TO START THE GAME"
  );

  socket.on("START_GAME", () => {
    startGame(socket);
  });

  socket.on("MONEY_INSERTED", () => {
    moneyInserted(socket);
  });

  socket.on("PRESSED_SPIN_BUTTON", () => {
    pressedSpinButton(socket);
  });

  socket.on("PRESSED_PLAY_AGAIN", () => {
    pressedPlayAgain(socket);
  });

  socket.on("EXIT_GAME", () => {
    exitGame(socket);
  });

  socket.on("disconnect", () => {
    console.log(`player with socket.id : ${socket.id} disconnected`);
  });
});

module.exports = { server, io, app };
