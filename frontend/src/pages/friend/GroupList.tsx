import { useEffect, useState } from "react";
import FriendService from "@/services/friend.service";
// import UserService from "@/services/user.service";

interface Group {
  _id: string;
  name: string;
  members: string[];
}

const GroupList = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
        const res = await FriendService.getgroups();
        console.log(res.result);
        setGroups(res.result)
    };
    fetchGroup();
  }, []);

  const filteredGroups = groups.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Danh sách nhóm 
        </h2>
        <span className="text-gray-500 text-sm">Tổng: {groups.length}</span>
      </div>

      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder="🔍 Tìm nhóm"
        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Danh sách bạn bè */}
      <div className="divide-y divide-gray-200">
        {filteredGroups.map((item, index) => (
          <div
            key={item._id}
            className="flex items-center py-3 hover:bg-gray-50 cursor-pointer"
          >
            <img
              src={`https://i.pravatar.cc/150?img=${index + 1}`}
            //   alt={item.hoten}
              className="w-10 h-10 rounded-full object-cover mr-4"
            />
            <span className="text-gray-900 font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupList;
