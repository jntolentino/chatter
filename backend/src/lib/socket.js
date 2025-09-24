import { Server } from "socket.io";
import http from "http";
import express from "express";
import { send } from "process";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

export function getReceiverSocketId(userId) {
  return userSocket_map[userId];
}

//store online users
const userSocket_map = {};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocket_map[userId] = socket.id;
    socket.userId = userId; // Save userId to socket instance
  }

  //used to send events to all connected clients
  io.emit("get-online-users", Object.keys(userSocket_map));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocket_map[userId];
    io.emit("get-online-users", Object.keys(userSocket_map));
  });

  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        senderId: socket.userId,
      });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        senderId: socket.userId,
      });
    }
  });
});

export { io, app, server };
