const Friend = require("../models/friend.model");

class friendService {
    // gửi lời mời kết bạn
    async sendFriendRequest(user1, user2) {
        const exist = await Friend.findOne({
            $or: [
                {user1, user2},
                {user1: user2, user2: user1},
            ]
        })

        if (exist) return null;

        return Friend.create({user1,user2})
    }
    // chấp nhận lời mời kết bạn
    async acceptRequest(idRequest, currentUserId) {
        const result = await Friend.findById(idRequest);
        if (!result || result.user2.toString() !== currentUserId )
            return null;
        result.status = "accepted";
        await result.save();
        console.log(result.user1.toString());
        console.log(result.user2.toString());

        return {
            user1: result.user1.toString(),
            user2: result.user2.toString(),
        }
    }
    // từ chối lời mời kết bạn
    async rejectRequest(idRequest, currentUserId) {
        const result = await Friend.findById(idRequest);
        if (!result || result.user2.toString() !== currentUserId){
            return null;
        }
        // xóa bỏ lời mời đó
        await Friend.findByIdAndDelete(idRequest);
        return {
            message: "Đã từ chối lời mời"
        }
    }
    // lấy danh sách bạn bè
    async getFriendList(currentUserId) {
        const result = await Friend.find({
          $or: [{ user1: currentUserId }, { user2: currentUserId }],
          status: "accepted",
        });

        const myFriendIds = result.map(
            f=> f.user1.toString() === currentUserId ? f.user2 : f.user1
        )
        console.log(myFriendIds)
        return myFriendIds;
    }
    // lấy danh sách lời mời kết bạn
    async getRequestAddFriend(currentUserId) {
        const result =  await Friend.find({
            user2: currentUserId,
            status:"pending"
        })
        return result;
    }
}

module.exports = new friendService()