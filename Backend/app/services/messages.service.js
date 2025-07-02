const Message = require("../models/message.model")
const mongoose = require("mongoose");

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
    return await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate("senderId", "hoten email");
  }

  async getMessagesById(messageId) {
    console.log(messageId)
    return await Message.findOne({
      _id: new mongoose.Types.ObjectId(messageId),
    });
  }
}

module.exports = new MessageService();