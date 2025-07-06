import { useState } from "react";
import { Button } from "../ui/button";
import AddMembersModal from "./AddGroupMemberModal";
import GroupMemberList from "./GroupMemberList";

interface User {
  _id: string;
  hoten: string;
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
  conversation: Conversation;
  messages: Message[];
  onClose: () => void;
}

export default function ConversationInfo({ conversation, messages }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [conver, setConversation] = useState<Conversation>();
  const currentConversation = conver || conversation ;
  const [activeTab, setActiveTab] = useState<"image" | "video" | "file">(
    "image"
  );

  if (showMember) {
    return (
      <GroupMemberList 
        members={currentConversation.members}
        onBack={() => setShowMember(false)} 
        conversation={currentConversation}
        setConversation={setConversation}
        />
    )
  }
  return (
    <div className="h-full w-full p-4 bg-white border-l">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Thông tin cuộc trò chuyện</h2>
      </div>
      <img
        src={currentConversation.Avatar}
        className="w-24 h-24 rounded-full mx-auto"
        alt="Avatar"
      />
      <h3 className="text-center text-xl font-semibold mt-2">
        {currentConversation.type === "group"
          ? currentConversation.name
          : currentConversation.otherUser}
      </h3>
      <div className="mt-4">
        {currentConversation.type === "group" && (
          <Button onClick={() => setShowAdd(true)}>Thêm thành viên</Button>
        )}
      </div>
      {showAdd && (
        <AddMembersModal
          onClose={() => setShowAdd(false)}
          conversation={currentConversation}
          setConversation={setConversation}
        />
      )}

      <div className="mt-4">
        <h4 className="font-semibold mb-2">
          Thành viên nhóm ({currentConversation.members.length})
        </h4>
        <Button onClick={() => setShowMember(true)}>Xem thành viên</Button>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Ảnh / Video / Tệp</h3>

        {/* Tabs */}
        <div className="flex space-x-2 mb-2">
          {(["image", "video", "file"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab === "image" ? "Ảnh" : tab === "video" ? "Video" : "Tệp"}
            </button>
          ))}
        </div>

        {/* Nội dung tab */}
        <div className="grid grid-cols-3 gap-2">
          {messages
            .filter((m) => m.type === activeTab)
            .map((m) => (
              <div key={m._id}>
                {activeTab === "image" ? (
                  <img
                    src={m.file}
                    alt="img"
                    className="w-full h-24 object-cover rounded"
                  />
                ) : activeTab === "video" ? (
                  <video controls className="w-full h-24 object-cover rounded">
                    <source src={m.file} type="video/mp4" />
                    Trình duyệt không hỗ trợ video.
                  </video>
                ) : (
                  <a
                    href={m.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline text-sm break-words block"
                  >
                    📎 {m.content}
                  </a>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
