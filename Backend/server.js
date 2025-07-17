const app = require("./app");
const config = require("./app/config/mongoDB");
const MongoDB = require("./app/utils/mongodb.util");
const http = require("http");
const socketUtil = require("./app/utils/socket.util");

async function startServer() {
  try {
    await MongoDB.connect(config.db.uri);
    console.log("Connected to the database");

    const PORT = config.app.port;

    const server = http.createServer(app);

    const io = socketUtil.init(server);

    // io.on("connection", (socket) => {
    //   console.log(`user connection ${socket.id}`);

    //   socket.on("join_room", (room) => {
    //     socket.join(room);
    //     console.log(`sokect ${socket.id} joined room ${room}`);
    //   });

    //   socket.on("send_message", async (data) => {
    //     try {
    //       const message = await messageSchema.create({
    //         conversationId: data.conversationId,
    //         senderId: data.senderId,
    //         content: data.content,
    //         type: data.type,
    //       });

    //       const populateMessage = await message.populate("senderId", "hoten email")
    //       io.to(data.conversationId).emit("receive_message", populateMessage);
    //     } catch (error) {
    //         console.error("Lỗi khi lưu tin nhắn:", error);
    //         socket.emit("error_message", { error: "Gửi tin nhắn thất bại." });
    //     }
    //   });

    //   socket.on("disconnect", () => {
    //     console.log(`user disconnected ${socket.id}`);
    //   });
    // });

    server.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    console.log(`db uri: ${process.env.MONGODB_URI}`);
    });
  } catch (error) {
    console.log("Cannot connect to the database", error);
    process.exit();
  }
}

startServer();
