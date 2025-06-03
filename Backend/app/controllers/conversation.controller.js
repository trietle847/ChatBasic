const conversationService = require("../services/conversation.service");
const ApiError = require("../api-error");

exports.createCoversation = async (req, res, next) => {
  try {
    const { memberIds, name } = req.body;
    const conversation = await conversationService.findAndCreate(
      memberIds,
      name
    );

    return res.send({
      message: "Tạo thành công cuộc trò chuyện",
      conversation,
    });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi tạo cuộc trò chuyên ${error.message}`)
    );
  }
};

exports.getUserConversation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const conversations = await conversationService.getUserCoversation(userId);

    return res.send({
      message: "Danh sách các cuộc trò chuyện",
      conversations,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi ${error.message}`));
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { conversationId, memberId } = req.body;
    const result = await conversationService.addMember(
      conversationId,
      memberId
    );
    return res.send({
      message: "Them thanh cong",
      result,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi ${error.message}`));
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { conversationId, memberId } = req.body;
    const result = await conversationService.removeMember(
      conversationId,
      memberId
    );
    return res.send({
      message: "Xoa thanh cong",
      result,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi ${error.message}`));
  }
};

exports.renameConversation = async (req, res, next) => {
  try {
    const { conversationId, name } = req.body;
    const result = await conversationService.renameConversation(
      conversationId,
      name
    );
    return res.send({
      message: "Doi ten thanh cong",
      result,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi ${error.message}`));
  }
};

exports.deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const result = await conversationService.deleteConversation(conversationId);
    return res.send({
      message: "xóa thành công",
      result,
    });
  } catch (error) {
    return next(new ApiError(500, `Lỗi ${error.message}`));
  }
};
