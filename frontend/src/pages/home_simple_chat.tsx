import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import  Sidebar  from "@/components/selfCreate/sidebar";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faGear, faUserPlus, faSearch, faPaperclip} from "@fortawesome/free-solid-svg-icons";

import { useState, useEffect, useRef } from "react";

import { useSocket } from "@/socket/socketContex";

import userService from "@/services/user.service";
import conversationService from "@/services/conversation.service";
import messageService, {
  type dataMessage,
  type ListMessage,
} from "@/services/message.service";

import { CallOverlay } from "@/components/selfCreate/CallScreen";


interface Message {
  _id: string;
  senderId: { _id: string; hoten?: string; email?: string } | string;
  content: string;
  file?: string;
  type: "text" | "file" | "image" | "video";
}

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

const Home = () => {
  // useState là một hook, quản lý trạng thái
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const socket = useSocket();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [callInfo, setCallInfo] = useState<{ channel: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
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
                    otherUser: otherRes.user.hoten,
                    Avatar: otherRes.user.avatar,
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
        console.log(updateDataConvs);
      } catch (error) {
        console.error("Lỗi khi load cuộc trò chuyện hoặc user:", error);
      }
    };

    fetchConversations();

  }, []);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.on("receive_agora_call", ({ channel, members }) => {
      if (members.includes(userId)) {
        setCallInfo({ channel });
      }
    });
    

    return () => {
      socket.off("receive_agora_call");
    };
  }, [socket, userId]);
  
  
  useEffect(() => {
    if (!currentConversation || !socket) return;
    // Lắng nghe tin nhắn mới từ server
    socket.on("receive_message", (message: Message) => {
      // on nghe sự kiện
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket?.off("receive_message");
    };
  }, [currentConversation, socket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = (conversation: Conversation) => {
    if (!socket) return;

    const idcon: ListMessage = { conversationId: conversation._id };

    // Lấy tin nhắn
    messageService
      .getMessage(idcon)
      .then((data) => {
        setMessages(data.messages);
        socket?.emit("join_room", conversation._id);
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

    socket?.emit("send_message", dataMessage);

    setNewMessage("");
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setMessages([]); 
    loadMessages(conversation)
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !currentConversation) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", currentConversation._id);
    formData.append("senderId", userId);
    formData.append("type", "file");

    try {
      const response = await messageService.uploadFile(formData); 
      const msg = response.message;
      console.log(response)
      socket?.emit("send_message", msg);
    } catch (err) {
      console.error("Lỗi upload file:", err);
    } finally {
      e.target.value = ""; // reset file input
    }
  };
  

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      <div className="w-1/4 bg-white p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="flex items-center justify-between mb-4 space-x-2">
          <div className="flex items-center flex-1 bg-gray-100 rounded-md px-2">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />{" "}
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
            className="text-blue-600 hover:bg-blue-100 transition cursor-pointer"
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

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {currentConversation?.type === "group"
              ? currentConversation?.name
              : currentConversation?.otherUser}{" "}
          </h3>
          <div className="flex gap-4 items-center">
            <button
              className="text-gray-600 hover:text-blue-600 transition"
              onClick={() => {
                if (currentConversation && userId && socket) {
                  const channel = currentConversation._id;
                  setCallInfo({ channel });
                  console.log(
                    "[UI] Gọi điện được nhấn: đang gọi joinChannel..."
                  );
                  socket.emit("agora_call_start", {
                    channel,
                    members: currentConversation.members.map((m) => m._id),
                  });
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
                      ) : msg.type === "image" ? (
                        <img
                          src={msg.file}
                          alt={msg.content}
                          className="max-w-[200px] rounded"
                        />
                      ) : msg.type === "video" ? (
                        <video controls className="max-w-[250px] rounded">
                          <source src={msg.file} type="video/mp4" />
                          Trình duyệt không hỗ trợ video
                        </video>
                      ) : msg.type === "file" ? (
                        <a
                          href={msg.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-blue-200"
                        >
                          📎 {msg.content}
                        </a>
                      ) : (
                        <em>[Unsupported]</em>
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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-blue-500"
          >
            <FontAwesomeIcon icon={faPaperclip} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
      {callInfo && (
        <CallOverlay
          channel={callInfo.channel}
          onClose={() => {
            setCallInfo(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;
