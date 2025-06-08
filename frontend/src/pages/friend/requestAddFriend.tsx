import { useEffect, useState } from "react";
import FriendService from "@/services/friend.service";
import UserService from "@/services/user.service";
import { useSocket } from "@/socket/socketContex";

import { Button } from "@/components/ui/button";

interface Request {
  _id: string;
  user1: string;
  hotenUser1: string;
  user2: string;
}

// interface User {
//   _id: string;
//   hoten: string;
// }

const FriendsList = () => {
  const [request, setRequest] = useState<Request[]>([]);
  const socket = useSocket();

  const fetchRequest = async () => {
    const res = await FriendService.getRequestAddFriend();
    const listRequest: Request[] = res.result;

    const userIds = listRequest.map((r) => r.user1);
    const promise = userIds.map((id) => UserService.findUserById(id));
    const result = await Promise.all(promise);

    const fullRequest = listRequest.map((r, index) => ({
      ...r,
      hotenUser1: result[index].user.hoten,
    }));

    setRequest(fullRequest);
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleFriendRequest = async () => {
      await fetchRequest();
    } 

    socket.on("receive_friend_request", handleFriendRequest);

    return () => {
      socket.off("receive_friend_request",handleFriendRequest);
    };
  },[socket]);
  
  const handleAcceptRequest = async (id: string) => {
    try {
      const result = await FriendService.acceptRequest(id);
      console.log(result);
      setRequest((req) => req.filter((r) => r._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await FriendService.rejectRequest(id);
      setRequest((req) => req.filter((r) => r._id !== id));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Lời mời kết bạn</h2>

      {request.length === 0 ? (
        <p className="text-gray-500 text-center">Không có lời mời nào.</p>
      ) : (
        <div className="space-y-4">
          {request.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:shadow transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`https://i.pravatar.cc/150?u=${req.user1}`}
                  alt={req.hotenUser1}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <span className="text-lg font-medium text-gray-800">
                  {req.hotenUser1}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => handleAcceptRequest(req._id)}
                >
                  Chấp nhận
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectRequest(req._id)}
                >
                  Từ chối
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
