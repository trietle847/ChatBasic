const Conversation = require("../models/conversation.model");

class ConversationService {
  async findAndCreate(memberIds, name = "") {
    if (memberIds.length === 2) {
      const existing = await Conversation.findOne({
        members: {
          $all: memberIds,
          $size: 2,
        },
      });
      if (existing) return existing;

      const conversation = new Conversation({
        name: "private",
        members: memberIds,
      });
      return await conversation.save();
    }
    const conversation = new Conversation({
      name: name,
      members: memberIds,
      type: "group",
    });
    return await conversation.save();
  }

  // lấy các cuộc trò chuyện của user
  async getUserCoversation(userId) {
    return await Conversation.find({
      members: userId,
    }).populate("members", "tendangnhap");
  }

  // xóa thành viên
  async removeMember(conversationId, userId) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $pull: { members: userId } },
      { new: true }
    );
  }

  // thêm thành viên
  async addMember(conversationId, userId) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  }

  // đổi tên cuộc trò chuyện
  async renameConversation(conversationId, name) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { name },
      { new: true }
    );
  }

  // xóa cuộc trò chuyện
  async deleteConversation(conversationId) {
    return await Conversation.findByIdAndDelete(conversationId);
  }

  async updateLastMessage(conversationId, messageId) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: messageId },
      { new: true }
    );
  }
}

module.exports = new ConversationService();
