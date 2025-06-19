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
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conv: Conversation) => void;
}

export default function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
}: Props) {
  return (
    <div className="w-1/4 bg-white p-4 border-r overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
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
      <div className="space-y-3">
        {conversations.map((conv) => (
          <Card
            key={conv._id}
            onClick={() => onSelectConversation(conv)}
            className={`cursor-pointer ${
              currentConversationId === conv._id
                ? "border-blue-500 border-2"
                : ""
            }`}
          >
            <CardContent className="flex items-center space-x-3 py-3">
              <Avatar>
                <AvatarImage src={conv.Avatar} />
                <AvatarFallback>
                  {conv.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate">
                {conv.type === "group" ? conv.name : conv.otherUser}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
