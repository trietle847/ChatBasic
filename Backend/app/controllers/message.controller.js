const ApiError = require("../api-error");
const messageService = require("../services/messages.service");
const conversationService = require("../services/conversation.service");

exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.userId;

    const Message = await messageService.sendMessage({
      conversationId,
      senderId,
      content,
    });

    await conversationService.updateLastMessage(conversationId, Message._id);

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
    new ApiError(500, `Lỗi khi lấy tin nhắn ${error.message}`);
  }
};
