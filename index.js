const { server, app } = require("./socket.io/socket");

const dotenv = require("dotenv");

dotenv.config({ path: "./.env" });

app.get("/", (req, res) => {
  return res.status(200).send({
    message: "Welcome to Slot-Machine-App",
    statusCode: 200,
    path: "/home",
  });
});

server.listen((process.env.PORT ??= 5000), () => {
  console.log("server running on port :", process.env.PORT);
});
