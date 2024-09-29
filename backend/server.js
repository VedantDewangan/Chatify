const { route } = require("./Routes");
const { ConnectDB } = require("./DataBase/ConnectDB");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const PORT = 3000 || process.env.PORT;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "https://chatify.onrender.com",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use("/api", route);

const users = {};

io.on("connection", (socket) => {
  socket.on("connect", () => {
    console.log(`User connected with id: ${socket.id}`);
  });

  socket.on("user-joined", (username) => {
    users[socket.id] = username;
    io.emit("user-list", users);
    io.emit("user-status", { user: username, status: "online" });
  });

  socket.on("joinRoom", (roomNumber) => {
    socket.join(roomNumber);
  });

  socket.on("send", ({ roomNumber, obj }) => {
    socket.to(roomNumber).emit("recive", { roomNumber, obj });
  });

  socket.on("user-logout", (username) => {
    const socketId = Object.keys(users).find((key) => users[key] === username);
    if (socketId) {
      delete users[socketId];
      io.emit("user-list", users);
      io.emit("user-status", { user: username, status: "offline" });
    }
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("user-list", users);
    io.emit("user-status", { user: username, status: "offline" });
  });
});

ConnectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Your backend is working in port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
