const app = require("express")();
const http = require("http");
const { Server } = require("socket.io");

const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("new player joined with socket.id :", socket.id);

  socket.on("disconnect", () => {
    console.log(`player with socket.id : ${socket.id} disconnected`);
  });
});

server.listen((process.env.PORT ??= 5000), () => {
  console.log("server running on port :", process.env.PORT);
});
