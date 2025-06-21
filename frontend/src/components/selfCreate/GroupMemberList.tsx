import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import userService from "@/services/user.service";
import conversationService from "@/services/conversation.service";
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

export default function GroupMemberList({ members ,conversation , onBack, setConversation }: Props) {
    const [dataInfo, setDataInfo] = useState<User[]>([]);
    useEffect(() => {
      const fetchMemberDetails = async () => {
        try {
          const results = await Promise.all(
            members.map((m) => userService.findUserById(m._id))
          );
          const users = results.map((r) => r.user)
          setDataInfo(users); 
        } catch (err) {
          console.error("Lỗi khi lấy thông tin thành viên:", err);
        }
      };

      fetchMemberDetails();
    }, [members]);

    const handleRemove = async (userId: string) => {
        try {
            const result = await conversationService.deleteUser({
                conversationId: conversation._id,
                memberId: userId,
            })
            console.log(result);
            const updateCoversation: Conversation = {
                ...conversation,
                members: conversation.members.filter((m) => m._id !== userId)
            }
            setConversation(updateCoversation);
        } catch (error) {
            console.log(error);
        }
    }

    // useEffect(() => {
    //   console.log("dataInfo đã cập nhật:", dataInfo);
    // }, [dataInfo]);
      
    return (
    <div className="h-full w-full p-4 bg-white border-l">
      <button className="mb-4 text-blue-600" onClick={onBack}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Thành viên</h2>
        <Button variant="outline">👤 Thêm thành viên</Button>
      </div>
      <input
        type="text"
        placeholder="Tìm kiếm thành viên"
        className="border px-3 py-2 rounded w-full mb-4"
      />
      <ul className="space-y-3 max-h-[500px] overflow-y-auto">
        {dataInfo.map((user) => (
          <li key={user._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                className="w-10 h-10 rounded-full"
                alt={user.tendangnhap}
              />
              <div>
                <div className="font-medium">{user.hoten}</div>
              </div>
            </div>
              <Button size="sm">Kết bạn</Button>
              <Button onClick={() => handleRemove(user._id)}>Xóa</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
