import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faGear, faUserPlus, faSearch} from "@fortawesome/free-solid-svg-icons";


import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import userService from "@/services/user.service";
import conversationService from "@/services/conversation.service";
import messageService, {
  type dataMessage,
  type ListMessage,
} from "@/services/message.service";

interface Message {
  _id: string;
  senderId: { _id: string; hoten?: string; email?: string } | string;
  content: string;
  type: string;
}

interface User {
  _id: string;
  tendangnhap: string;
}

interface Conversation {
  _id: string;
  createdAt: string;
  type: string;
  name: string;
  members: User[];
  otherUser?: string;
}

const SOCKET_SERVER_URL = "http://localhost:3000";

const Home = () => {
  // useState là một hook, quản lý trạng thái
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    //io: khởi tạo kết nối đến sv SocketIO

    // lấy thông tin các cuộc trò chuyện của người dùng đang đăng nhập
    const fetchConversations = async () => {
      try {
        const me = await userService.getMe();
        // console.log(me);
        setUserId(me.user._id)

        const response = await conversationService.getConversation();
        const dataConvs = response.data.conversations;

        const updateDataConvs = await Promise.all(
          dataConvs.map(async (conv: Conversation) => {
            if (conv.type === "private") {
              const otherUser = conv.members.find(
                (member) => member._id !== me.user._id
              );

              if (otherUser) {
                try {
                  const otherRes = await userService.findUserById(otherUser._id)
                  return {
                    ...conv,
                    otherUser: otherRes.user.hoten
                  }
                } catch (error) {
                  console.log("Lỗi",error)
                  return { ...conv, otherUser: "Unknown" };
                }
              }
            }
            return conv;
          })
        )
        setConversations(updateDataConvs);
      } catch (error) {
        console.error("Lỗi khi load cuộc trò chuyện hoặc user:", error);
      }
    };

    fetchConversations();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);
  
  useEffect(() => {
    if (!currentConversation || !socketRef.current) return;
    // Lắng nghe tin nhắn mới từ server
    socketRef.current.on("receive_message", (message: Message) => {
      // on nghe sự kiện
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.off("receive_message");
    };
  }, [currentConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = (conversation: Conversation) => {
    if (!socketRef.current) return;

    const idcon: ListMessage = { conversationId: conversation._id };

    // Lấy tin nhắn
    messageService
      .getMessage(idcon)
      .then((data) => {
        setMessages(data.messages);
        socketRef.current?.emit("join_room", conversation._id);
      })
      .catch((err) => {
        console.error(
          "Không lấy được message:",
          err.response?.data || err.message
        );
      });
  }

  const handleSend = () => {
    if (!newMessage.trim() || !userId || !currentConversation) return;

    const dataMessage: dataMessage = {
      conversationId: currentConversation._id,
      senderId: userId,
      content: newMessage,
      type: "text",
    };

    socketRef.current?.emit("send_message", dataMessage)

    setNewMessage("");
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages([]); 
    loadMessages(conversation)
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="flex items-center justify-between mb-4 space-x-2">
          <div className="flex items-center flex-1 bg-gray-100 rounded-md px-2">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
            <Input
              id="searchFriend"
              type="text"
              placeholder="Tìm kiếm"
              className="border-none shadow-none focus-visible:ring-0 focus:outline-none bg-transparent ml-2"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-100 transition"
          >
            <FontAwesomeIcon icon={faUserPlus} />
          </Button>
        </div>

        <div className="space-y-3">
          {conversations.map((conv) => (
            <Card
              key={conv._id}
              onClick={() => handleSelectConversation(conv)}
              className={`cursor-pointer ${
                currentConversation?._id === conv._id
                  ? "border-blue-500 border-2"
                  : ""
              }`}
            >
              <CardContent className="flex items-center space-x-3 py-3">
                <Avatar>
                  <AvatarImage
                    src={`https://i.pravatar.cc/150?u=${conv._id}`}
                  />
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {currentConversation?.type === "group"
              ? currentConversation?.name
              : currentConversation?.otherUser}{" "}
          </h3>
          <div className="flex gap-4 items-center">
            <button className="text-gray-600 hover:text-blue-600 transition">
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

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex flex-col p-6 space-y-4">
            {messages.map((msg, index) => {
              const sender =
                typeof msg.senderId === "string"
                  ? msg.senderId
                  : msg.senderId._id;
              const isMe = sender === userId;
              return (
                <div
                  key={index}
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  } items-start`}
                >
                  <div className="flex flex-col max-w-xs">
                    {typeof msg.senderId !== "string" && (
                      <span
                        className={`text-xs text-gray-500 mb-1 ${
                          isMe ? "text-right pr-2" : "text-left"
                        }`}
                      >
                        {isMe ? "Bạn" : msg.senderId.hoten}
                      </span>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-2 shadow-md ${
                        isMe ? "bg-blue-500 text-white self-end" : "bg-gray-200"
                      }`}
                    >
                      {msg.type === "text" ? (
                        msg.content
                      ) : (
                        <em>[Unsupported type]</em>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
