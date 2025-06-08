const ApiError = require("../api-error");
const friendService = require("../services/friend.service")
const Conversation = require("../models/conversation.model")
const socketUtil = require("../utils/socket.util");

exports.sendRequest = async (req, res, next) => {
    try {
      console.log(req.user.userId);
      const result = await friendService.sendFriendRequest(
        req.user.userId,
        req.body.receiverId
      );
      if (!result) return next(new ApiError(400, "Đã gửi lời mời kết bạn rồi"));

    //  phát tín hiệu socket cho người nhận
    const io = socketUtil.getIO();
    const receiverSocketId = socketUtil.getUserSocketId(req.body.receiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_friend_request", {
            fromUserId: req.user.userId,
            message: "Bạn có một lời mời kết bạn mới!",
            request: result,
        });
    };

      res.send({
        message: "Đã gửi lời mời kết bạn",
        result,
      });
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}

exports.acceptRequest = async (req, res, next) => {
    try {
        const result = await friendService.acceptRequest(
            req.body.idRequest, 
            req.user.userId
        )
        if (!result) 
            return next(new ApiError(400,"Không thể đồng ý lời mời"))
        // nếu chấp nhận thì tạo cuộc trò chuyện mới
        const {user1, user2} = result

        // kiểm tra tồn tại cuộc trò chuyện chưa
        const existing = await Conversation.findOne({
            type: "private",
            members: {$all: [user1, user2], $size: 2},
        })

        if (!existing){
            const conversation = await Conversation.create({
                type: "private",
                members: [user1, user2],
            });
            return res.send({
              message: "Chấp nhận lời mời thành công",
              conversation
            });
        }
        return res.send({
          message: "Xác nhận kết bạn. Đã có cuộc trò chuyện.",
        });
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}

exports.rejectRequest = async (req, res, next) => {
    try {
        const result = await friendService.rejectRequest(
          req.body.idRequest,
          req.user.userId
        );
        if (!result) {
          return res
            .status(400)
            .send({ message: "Lời mời không hợp lệ hoặc đã xử lý" });
        }

        return res.send({
          message: "Từ chối lời mời kết bạn thành công",
          result,
        });
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}

exports.getFriendList = async (req, res, next) => {
    try {
        const result = await friendService.getFriendList(req.user.userId);
        if (result.length === 0) {
            return next(new ApiError(400, "Chưa có người bạn nào"));
        }
        return res.send({
            message: "Danh sách bạn bè",
            result
        })
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}

exports.getRequestAddFriend = async (req, res, next) => {
    try {
        const result = await friendService.getRequestAddFriend(req.user.userId);
        if (result.length === 0){
            return next(new ApiError(400,"Chưa có lời mời kết bạn nào"))
        }
        return res.send({
            message: "Danh sách lời mời kết bạn",
            result
        })
    } catch (error) {
        return next(new ApiError(500, error.message));
    }
}