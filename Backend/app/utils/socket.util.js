let io = null;
const userSocketMap = new Map();
const messageSchema = require("../models/message.model");
const conversationSchema = require("../models/conversation.model");

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "https://chatbasic.onrender.com", //"http://localhost:5173",
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

          console.log("thông tin", updatedConversation);

          let convToEmit = {
            ...updatedConversation,
            lastMessage: populateMessage.content,
            senderLastMessage: populateMessage.senderId.hoten,
            senderLastMessageId: populateMessage.senderId._id,
          };

          if (updatedConversation.type === "private") {
            const otherUser = updatedConversation.members.find(
              (m) => m._id.toString() !== data.senderId
            );
            if (otherUser) {
              convToEmit.otherUser = otherUser.hoten;
              convToEmit.Avatar = otherUser.avatar;
            }
          } else if (updatedConversation.type === "group") {
            convToEmit.Avatar = updatedConversation.Avatar;
            convToEmit.otherUser = updatedConversation.name || "Nhóm";
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
          const socketId = userSocketMap.get(userId);
          console.log("user đã xem tin nhắn ", socketId);
          if (socketId) {
            io.to(socketId).emit("mark_as_read_success", {
              conversationId,
            });
          }
        } catch (err) {
          console.error("Lỗi khi đánh dấu đã đọc:", err);
        }
      });

      // socket.on("send_system_message",
      //   async ({
      //     conversationId,
      //     content,
      //     senderId,
      //     receiverID,readBy = [],
      //   }) => {
      //     try {
      //       const message = await messageSchema.create({
      //         conversationId,
      //         senderId,
      //         receiverID,
      //         content,
      //         type: "system",
      //         readBy,
      //       });
      //       io.to(conversationId).emit("receive_message", message);

      //       // Update lastMessage trong conversation
      //       await conversationSchema.findByIdAndUpdate(
      //         conversationId,
      //         { lastMessage: message._id },
      //         { new: true }
      //       );
      //     } catch (error) {
      //       console.error("Lỗi khi gửi tin nhắn hệ thống:", error);
      //     }
      //   }
      // );

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

      socket.on(
        "call_request",
        ({ to, from, channel, conversationId, callerName }) => {
          const targetSocketId = userSocketMap.get(to);
          if (targetSocketId) {
            io.to(targetSocketId).emit("receive_call_request", {
              from,
              channel,
              conversationId,
              callerName,
            });
            console.log(`Đã gửi yêu cầu gọi từ ${from} đến ${to}`);
          }
        }
      );

      socket.on(
        "call_response",
        async ({ to, accepted, channel, conversationId, senderId }) => {
          const targetSocketId = userSocketMap.get(to);
          if (targetSocketId) {
            io.to(targetSocketId).emit("call_response_result", {
              accepted,
              channel,
              conversationId,
              senderId,
            });
            console.log(
              `${senderId} Phản hồi gọi: ${accepted ? "Chấp nhận" : "Từ chối"}`
            );

            if (accepted === false) {
              const message = await messageSchema.create({
                conversationId,
                senderId,
                content: "call-ended-rejected",
                type: "call",
                readBy: [senderId, to],
              });

              io.to(conversationId).emit("receive_message", message);

              await conversationSchema.findByIdAndUpdate(
                conversationId,
                { lastMessage: message._id },
                { new: true }
              );
            }
          }
        }
      );

      socket.on("end_call", async ({ conversationId, senderId }) => {
        try {
          const message = await messageSchema.create({
            conversationId,
            senderId,
            content: "call-ended",
            type: "call",
            readBy: [senderId],
          });

          io.to(conversationId).emit("receive_message", message);

          await conversationSchema.findByIdAndUpdate(
            conversationId,
            { lastMessage: message._id },
            { new: true }
          );

          const updatedConversation = await conversationSchema
            .findById(conversationId)
            .populate("members", "hoten avatar")
            .lean();

          const convToEmit = {
            ...updatedConversation,
            lastMessage: "Cuộc gọi đã kết thúc",
            senderLastMessage: "Hệ thống",
            senderLastMessageId: "system",
          };

          if (updatedConversation.type === "private") {
            const otherUser = updatedConversation.members.find(
              (m) => m._id.toString() !== senderId
            );
            if (otherUser) {
              convToEmit.otherUser = otherUser.hoten;
              convToEmit.Avatar = otherUser.avatar;
            }
          }
          io.to(conversationId).emit("conversation_updated", convToEmit);

          // Broadcast thêm sự kiện để đóng UI gọi bên kia
          io.to(conversationId).emit("call_force_ended");
        } catch (err) {
          console.error("[SERVER] Lỗi khi xử lý end_call:", err);
        }
      });

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

      socket.on(
        "group_call_request",
        ({ from, to, channel, conversationId }) => {
          to.forEach((userId) => {
            const targetSocketId = userSocketMap.get(userId);
            if (targetSocketId) {
              io.to(targetSocketId).emit("receive_group_call", {
                from,
                channel,
                conversationId,
              });
            }
          });
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
