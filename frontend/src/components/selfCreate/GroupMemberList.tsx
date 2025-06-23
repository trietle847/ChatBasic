import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faUserPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import userService from "@/services/user.service";
import conversationService from "@/services/conversation.service";
import AddMembersModal from "./AddGroupMemberModal";
import { useSocket } from "@/socket/socketContex";

interface User {
  _id: string;
  tendangnhap: string;
  hoten: string;
  avatar: string;
}

interface Conversation {
  _id: string;
  createdAt: string;
  type: string;
  name: string;
  members: User[];
  otherUser?: string;
  Avatar: string;
}

interface Props {
  members: User[];
  conversation: Conversation;
  onBack: () => void;
  setConversation: (conv: Conversation) => void;
}

export default function GroupMemberList({
  members,
  conversation,
  onBack,
  setConversation,
}: Props) {
  const [dataInfo, setDataInfo] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const socket = useSocket();
  console.log(members)

  const fetchMemberDetails = async () => {
    try {
      const results = await Promise.all(
        members.map((m) => userService.findUserById(m._id))
      );
      const users = results.map((r) => r.user);
      setDataInfo(users);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin thành viên:", err);
    }
  };

  useEffect(() => {  
    fetchMemberDetails();
  }, [conversation,members]);

  const handleRemove = async (userId: string) => {
    try {
      await conversationService.deleteUser({
        conversationId: conversation._id,
        memberId: userId,
      });
      const updateMembers = conversation.members.filter((m) => m._id !== userId)
      const updatedConversation: Conversation = {
        ...conversation,
        members: updateMembers,
      };
      setConversation(updatedConversation);
      socket?.emit("send_conversation_update", updatedConversation);

      socket?.emit("kick_user_from_conversation", {
        to: userId,
        conversationId: conversation._id,
      })
      fetchMemberDetails()
    } catch (error) {
      console.error(error);
    }
  };

  const filteredMembers = dataInfo.filter((user) =>
    user.hoten.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full w-full p-4 bg-white border-l shadow-md rounded-lg">
      <button
        className="mb-4 text-blue-600 hover:text-blue-800 transition-all flex items-center gap-2"
        onClick={onBack}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách thành viên</h2>
        <Button
          variant="default"
          className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowAdd(true)}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Thêm
        </Button>
        {showAdd && (
                <AddMembersModal
                  onClose={() => setShowAdd(false)}
                  conversation={conversation}
                  setConversation={setConversation}
                />
              )}
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm thành viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border px-4 py-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-3 text-gray-400"
        />
      </div>

      <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {filteredMembers.map((user) => (
          <li
            key={user._id}
            className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.tendangnhap}
                className="w-11 h-11 rounded-full border-2 border-blue-500"
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{user.hoten}</span>
                <span className="text-sm text-gray-500">
                  @{user.tendangnhap}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                Kết bạn
              </Button>
              {conversation.type === "group" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(user._id)}
                >
                  Xóa
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
