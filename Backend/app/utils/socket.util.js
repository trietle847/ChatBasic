let io = null;
const userSocketMap = new Map();
const messageSchema = require("../models/message.model");

module.exports = {
  init: (server) => {
    const { Server, Socket } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "http://localhost:5173", // bạn nên chỉnh cho phù hợp domain client
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("socket connected", socket.id);

      socket.on("register_user", (userId) => {
        userSocketMap.set(userId, socket.id);
        socket.join(userId);
        console.log(`Registered user ${userId} với socket ${socket.id}`);
      });

      socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`sokect ${socket.id} joined room ${room}`);
      });

      socket.on("send_message", async (data) => {
        try {
          const message = await messageSchema.create({
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            type: data.type,
          });

          const populateMessage = await message.populate(
            "senderId",
            "hoten email"
          );
          io.to(data.conversationId).emit("receive_message", populateMessage);
        } catch (error) {
          console.error("Lỗi khi lưu tin nhắn:", error);
          socket.emit("error_message", { error: "Gửi tin nhắn thất bại." });
        }
      });

      socket.on("disconnect", () => {
        for (const [userId, socketId] of userSocketMap.entries()) {
          if (socketId === socket.id) {
            userSocketMap.delete(userId);
            break;
          }
        }
        console.log("Socket disconnected:", socket.id);
      });
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io chưa được khởi tạo!");
    }
    return io;
  },
  getUserSocketId: (userId) => {
    return userSocketMap.get(userId);
  },
};
