const { server, app } = require("./socket.io/socket");
const connectDB = require("./db/connection.js");
const userRouter = require("./routes/authRouter");
const errorHandler = require("./middlewares/errorMiddleware.js");
const express = require("express");
app.get("/", (req, res) => {
  return res.status(200).send({
    message: "Welcome to Slot-Machine-App",
    statusCode: 200,
    path: "/home",
  });
});
connectDB();
app.use(errorHandler);
app.use(express.json());
app.use("/api/v1/user", userRouter);

server.listen((process.env.PORT ??= 5000), () => {
  console.log("server running on port :", process.env.PORT);
});
