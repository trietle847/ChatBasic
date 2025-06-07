import { useEffect, useState } from "react";
import FriendService from "@/services/friend.service";
import UserService from "@/services/user.service";

interface Friend {
  user: User;
}

interface User {
  _id: string;
  hoten: string;
}

const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFriends = async () => {
      const ids = await FriendService.getMyFriend();
      const data = ids.result;
      const promises = data.map((f: string) => UserService.findUserById(f));
      const results = await Promise.all(promises);
      setFriends(results);
    };
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter((f) =>
    f.user.hoten.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Danh sách bạn bè
        </h2>
        <span className="text-gray-500 text-sm">Tổng: {friends.length}</span>
      </div>

      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder="🔍 Tìm bạn"
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Danh sách bạn bè */}
      <div className="divide-y divide-gray-200">
        {filteredFriends.map((item, index) => (
          <div
            key={item.user._id}
            className="flex items-center py-3 hover:bg-gray-50 cursor-pointer"
          >
            <img
              src={`https://i.pravatar.cc/150?img=${index + 1}`}
              alt={item.user.hoten}
              className="w-10 h-10 rounded-full object-cover mr-4"
            />
            <span className="text-gray-900 font-medium">{item.user.hoten}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
