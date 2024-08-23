const app = require("express")();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("new player joined with socket.id :", socket.id);

  socket.on("disconnect", () => {
    console.log(`player with socket.id : ${socket.id} disconnected`);
  });
});

module.exports = { server, io, app };
