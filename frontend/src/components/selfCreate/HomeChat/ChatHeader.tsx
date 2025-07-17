import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faGear,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import ChatInfo from "@/components/selfCreate/ChatInfo";
import { useState } from "react";

import RenameGroupModal from "@/components/selfCreate/RenameGroup";

import ConversationService from "@/services/conversation.service";

interface User {
  _id: string;
  tendangnhap: string;
  avatar: string;
  hoten: string;
}

interface Message {
  _id: string;
  senderId: string | { _id: string; hoten?: string };
  content: string;
  file?: string;
  type: "text" | "file" | "image" | "video" | "call";
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
  messages: Message[];
  userId: string | null;
  onCall: (channel: string, members: string[]) => void;
  onOpenInfo: () => void;
}

export default function ChatHeader({
  conversation,
  messages,
  userId,
  onCall,
  onOpenInfo,
}: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const [isEditing, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const handleRenameGroup = async (name: string) => {
    if (!conversation) return;
    try {
      const renameData = {
        name: name,
        conversationId: conversation._id,
      };
      const result = await ConversationService.renameConversation(renameData);
      conversation.name = name;
      console.log(result);
      setIsEditingName(false);
    } catch (error) {
      console.log(error);
    }
  };

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
              onClick={() => {
                setNewName(conversation.name);
                setIsEditingName(true);
              }}
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
      {isEditing && (
        <RenameGroupModal
          intialName={newName}
          onClose={() => setIsEditingName(false)}
          onSave={handleRenameGroup}
        />
      )}
    </>
  );
}
