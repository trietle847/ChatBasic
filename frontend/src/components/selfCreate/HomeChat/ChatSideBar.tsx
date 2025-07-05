import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faSearch } from "@fortawesome/free-solid-svg-icons";

interface User {
  _id: string;
  tendangnhap: string;
  avatar: string;
  hoten: string;
}

interface Conversation {
  _id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  name: string;
  members: User[];
  otherUser?: string;
  Avatar: string;
  lastMessage: string;
  senderLastMessage: string;
}

interface Props {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conv: Conversation) => void;
  unreadMap: Record<string, number>;
}

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  unreadMap,
}: Props) {
  return (
    <div className="w-1/4 bg-white p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Chats</h2>

      {/* Search + Add Button */}
      <div className="flex items-center justify-between mb-4 space-x-2">
        <div className="flex items-center flex-1 bg-gray-100 rounded-md px-2">
          <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
          <Input
            placeholder="Tìm kiếm"
            className="border-none shadow-none bg-transparent ml-2"
          />
        </div>
        <Button variant="ghost" size="icon">
          <FontAwesomeIcon icon={faUserPlus} />
        </Button>
      </div>

      {/* List of conversations */}
      <div className="space-y-2">
        {conversations.map((conv) => (
          <Card
            key={conv._id}
            onClick={() => onSelectConversation(conv)}
            className={`cursor-pointer transition-all ${
              currentConversationId === conv._id
                ? "border-blue-500 border-2 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
          >
            <CardContent className="flex items-center space-x-3 py-3">
              <Avatar>
                <AvatarImage src={conv.Avatar} />
                <AvatarFallback>
                  {(conv.type === "group" ? conv.name : conv.otherUser)
                    ?.slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium truncate text-sm text-gray-900">
                    {conv.type === "group" ? conv.name : conv.otherUser}
                  </span>
                  {unreadMap[conv._id] > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {unreadMap[conv._id]}
                    </span>
                  )}
                </div>

                <span className="text-xs text-gray-600 truncate max-w-[180px]">
                  {conv.senderLastMessage && (
                    <strong className="mr-1">{conv.senderLastMessage}:</strong>
                  )}
                  {conv.lastMessage}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
