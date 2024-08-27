const { server, app } = require("./socket.io/socket");
const connectDB = require("./db/connection.js");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");

const errorHandler = require("./middlewares/errorMiddleware.js");
const express = require("express");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allow cookies and authentication headers
  })
);

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
app.use("/api/v1/user", authRouter);
app.use("/api/v1/user", userRouter);

server.listen((process.env.PORT ??= 5000), () => {
  console.log("server running on port :", process.env.PORT);
});
