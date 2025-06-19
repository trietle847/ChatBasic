const ApiError = require("../api-error");
const messageService = require("../services/messages.service");
const conversationService = require("../services/conversation.service");
const socketUtil = require("../utils/socket.util");
const supabase = require("../config/supabase");

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.userId;

    let fileUrl = null;
    if (req.file) {
      const buffer = req.file.buffer;
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

      fileUrl = publicUrl.publicUrl;
    }

    const Message = await messageService.sendMessage({
      conversationId,
      senderId,
      content,
      fileUrl,
    });
    // console.log(process.env.SUPABASE_SERVICE_ROLE_KEY);

    await conversationService.updateLastMessage(conversationId, Message._id);

    const io = socketUtil.getIO();
    io.to(conversationId).emit("receive_message",Message)

    return res.send({
      message: "Tạo tin nhắn mới thành công",
      Message,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi tạo tin nhắn mới ${error.message}`));
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
