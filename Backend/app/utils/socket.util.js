let io = null;
const userSocketMap = new Map();
const messageSchema = require("../models/message.model");
const conversationSchema = require("../models/conversation.model")

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
            readBy: [data.senderId],
          });

          const populateMessage = await message.populate(
            "senderId",
            "hoten email"
          );

          await conversationSchema.findByIdAndUpdate(
            data.conversationId,
            { lastMessage: message._id },
            { new: true }
          );

          io.to(data.conversationId).emit("receive_message", populateMessage);

          const updatedConversation = await conversationSchema
            .findById(data.conversationId)
            .populate("members", "hoten avatar")
            .lean();

            let convToEmit = {
              ...updatedConversation,
              lastMessage: populateMessage.content,
              senderLastMessage: populateMessage.senderId.hoten,
              senderLastMessageId: populateMessage.senderId._id, // Thêm dòng này
            };

          if (updatedConversation.type === "private") {
            const otherUser = updatedConversation.members.find(
              (m) => m._id.toString() !== data.senderId
            );
            if (otherUser) {
              convToEmit.otherUser = otherUser.hoten;
              convToEmit.Avatar = otherUser.avatar;
            }
          }

          // Emit conversation_updated
          io.to(data.conversationId).emit("conversation_updated", convToEmit);

        } catch (error) {
          console.error("Lỗi khi lưu tin nhắn:", error);
          socket.emit("error_message", { error: "Gửi tin nhắn thất bại." });
        }
      });

      socket.on("mark_as_read", async ({ conversationId, userId }) => {
        try {
          await messageSchema.updateMany(
            {
              conversationId,
              readBy: { $ne: userId },
            },
            {
              $addToSet: { readBy: userId },
            }
          );
          io.to(conversationId).emit("mark_as_read_success", {conversationId,});

        } catch (err) {
          console.error("Lỗi khi đánh dấu đã đọc:", err);
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

      socket.on("send_conversation_update", (conversation) => {
        io.to(conversation._id).emit("conversation_updated", conversation);
      });

      socket.on("send_new_conversation", ({ to, conversation }) => {
        const socketId = userSocketMap.get(to);
        if (socketId) {
          io.to(socketId).emit("new_conversation", conversation);
        }
      });
      
      socket.on("kick_user_from_conversation", ({ to, conversationId }) => {
        const targetSocketId = userSocketMap.get(to);
        if (targetSocketId) {
          io.to(targetSocketId).emit("conversation_removed", {
            conversationId,
          });
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
