import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faGear } from "@fortawesome/free-solid-svg-icons";
interface User {
  _id: string;
  tendangnhap: string;
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
  conversation: Conversation | null;
  userId: string | null;
  onCall: (channel: string, members: string[]) => void;
}

export default function ChatHeader({ conversation, userId, onCall }: Props) {
  if (!conversation) return null;

  return (
    <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
      <h3 className="text-lg font-semibold">
        {conversation.type === "group"
          ? conversation.name
          : conversation.otherUser}
      </h3>
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
        <button className="text-gray-600 hover:text-blue-600 transition">
          <FontAwesomeIcon icon={faGear} />
        </button>
      </div>
    </div>
  );
}
