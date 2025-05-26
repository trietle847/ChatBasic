const Message = require("../models/message.model")

class MessageService {
  async sendMessage(conversationId, senderId, content) {
    const message = new Message(
      conversationId,
      senderId,
      content,
    );

    return await message.save();
  }

  async getMessages(conversationId) {
    return await Message.find({ conversationId }).populate(
      "sender",
      "hoten email"
    );
  }
}

module.exports = new MessageService();