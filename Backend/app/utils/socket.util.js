let io = null;
const userSocketMap = new Map();
const messageSchema = require("../models/message.model");

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket connected", socket.id);

      socket.on("register_user", (userId) => {
        userSocketMap.set(userId, socket.id);
        socket.join(userId);
        console.log(`Registered user ${userId} với socket ${socket.id}`);
      });

      socket.on("join_room", (room) => {
        socket.join(room);
        console.log(`socket ${socket.id} joined room ${room}`);
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

      socket.on("send_system_message", async ({ conversationId, content }) => {
        try {
          const message = await messageSchema.create({
            conversationId,
            content,
            type: "system",
          });
          io.to(conversationId).emit("receive_message", message);
        } catch (error) {
          console.error("Lỗi khi gửi tin nhắn hệ thống:", error);
        }
      });

      socket.on("agora_call_start", ({ channel, members }) => {
        console.log(`Cuộc gọi bắt đầu tại channel ${channel}`);
          members.forEach((memberId) => {
            const targetSocketId = userSocketMap.get(memberId);
            if (targetSocketId) {
              io.to(targetSocketId).emit("receive_agora_call", {
                channel,
                members,
              });
            }
          });
      });

      socket.on("call_request", ({ to, from, channel, conversationId }) => {
        const targetSocketId = userSocketMap.get(to);
        if (targetSocketId) {
          io.to(targetSocketId).emit("receive_call_request", {
            from,
            channel,
            conversationId,
          });
          console.log(`Đã gửi yêu cầu gọi từ ${from} đến ${to}`);
        }
      });

      socket.on(
        "call_response",
        ({ to, accepted, channel, conversationId }) => {
          const targetSocketId = userSocketMap.get(to);
          if (targetSocketId) {
            io.to(targetSocketId).emit("call_response_result", {
              accepted,
              channel,
              conversationId,
            });
            console.log(
              `Phản hồi gọi: ${accepted ? "Chấp nhận" : "Từ chối"} bởi ${to}`
            );
          }
        }
      );

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
