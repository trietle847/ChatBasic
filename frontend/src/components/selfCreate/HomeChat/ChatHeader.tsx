import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faGear, faPen } from "@fortawesome/free-solid-svg-icons";
import ChatInfo from "@/components/selfCreate/ChatInfo";
import { useState } from "react";

interface User {
  _id: string;
  tendangnhap: string;
  avatar: string;
}

interface Message {
  _id: string;
  senderId: string | { _id: string; hoten?: string };
  content: string;
  file?: string;
  type: "text" | "file" | "image" | "video" | "system";
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
  conversation: Conversation | null;
  messages: Message[]
  userId: string | null;
  onCall: (channel: string, members: string[]) => void;
  onOpenInfo: () => void; 
}

export default function ChatHeader({ conversation, messages ,userId, onCall, onOpenInfo }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  
  if (!conversation) return null;

  return (
    <>
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {conversation.type === "group"
              ? conversation.name
              : conversation.otherUser}
          </h3>

          {conversation.type === "group" && (
            <button
              className="text-gray-600 hover:text-blue-600 transition text-sm"
              onClick={() => alert("Đổi tên nhóm")}
            >
              <FontAwesomeIcon icon={faPen} />
            </button>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <button
            className="text-gray-600 hover:text-blue-600 transition"
            onClick={() => {
              if (conversation && userId) {
                const channel = conversation._id;
                onCall(
                  channel,
                  conversation.members.map((m) => m._id)
                );
              }
            }}
          >
            <FontAwesomeIcon icon={faPhone} />
          </button>
          <button className="text-gray-600 hover:text-blue-600 transition">
            <FontAwesomeIcon icon={faVideo} />
          </button>
          <button
            className="text-gray-600 hover:text-blue-600 transition"
            onClick={onOpenInfo}
          >
            <FontAwesomeIcon icon={faGear} />
          </button>
        </div>
      </div>
      {showInfo && (
        <ChatInfo
          conversation={conversation}
          messages={messages}
          onClose={() => setShowInfo(false)}
        />
      )}
    </>
  );
}
