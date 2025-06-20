const ApiError = require("../api-error");
const messageService = require("../services/messages.service");
const conversationService = require("../services/conversation.service");
const socketUtil = require("../utils/socket.util");
const supabase = require("../config/supabase");
const path = require("path");

exports.sendTextMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.userId;

    const Message = await messageService.sendMessage({
      conversationId,
      senderId,
      content,
      type: "text",
    });

    await conversationService.updateLastMessage(conversationId, Message._id);

    const io = socketUtil.getIO();
    io.to(conversationId).emit("receive_message", Message);

    return res.send({
      message: "Tạo tin nhắn văn bản thành công",
      Message,
    });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi gửi tin nhắn văn bản: ${error.message}`)
    );
  }
};

exports.sendFileMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const senderId = req.user.userId;

    if (!req.file) {
      return next(new ApiError(400, "Không có file được gửi"));
    }

    const buffer = req.file.buffer;
    const ext = path.extname(req.file.originalname);
    const fileName = `${Date.now()}-${req.file.originalname}`;

    const { error } = await supabase.storage
      .from("chatuploads")
      .upload(fileName, buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from("chatuploads")
      .getPublicUrl(fileName);

    const fileUrl = publicUrl.publicUrl;
    const content = req.file.originalname;

    let type = "file";
    if (req.file.mimetype.startsWith("image/")) {
      type = "image";
    } else if (req.file.mimetype.startsWith("video/")) {
      type = "video";
    }

    const Message = await messageService.sendMessage({
      conversationId,
      senderId,
      content,
      file: fileUrl,
      type,
    });

    await conversationService.updateLastMessage(conversationId, Message._id);

    const io = socketUtil.getIO();
    io.to(conversationId).emit("receive_message", Message);

    return res.send({
      message: "Gửi file thành công",
      Message,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi gửi file: ${error.message}`));
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const messages = await messageService.getMessages(conversationId);

    res.send({
      message: "Danh sách các tin nhắn",
      messages,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi lấy tin nhắn ${error.message}`))
  }
};
