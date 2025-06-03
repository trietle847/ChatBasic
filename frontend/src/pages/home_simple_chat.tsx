import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import userService from "@/services/user.service";
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

const SOCKET_SERVER_URL = "http://localhost:3000";

const Home = () => {
  // useState là một hook, quản lý trạng thái
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const conversationId = "68330651292d9fe78abc6485";

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    //io: khởi tạo kết nối đến sv SocketIO
    const idcon: ListMessage = { conversationId };

    // Lấy tin nhắn
    messageService
      .getMessage(idcon)
      .then((data) => {
        setMessages(data.messages);
      })
      .catch((err) => {
        console.error(
          "Không lấy được message:",
          err.response?.data || err.message
        );
      });

    // Lấy thông tin user hiện tại
    userService
      .getMe()
      .then((data) => {
        const currentUserId = data.user._id;
        setUserId(currentUserId);
        socketRef.current?.emit("join_room", conversationId);
      })
      .catch((err) => {
        console.error(
          "Không lấy được user:",
          err.response?.data || err.message
        );
      });

    // Lắng nghe tin nhắn mới từ server
    socketRef.current.on("receive_message", (message: Message) => {
      // on nghe sự kiện
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !userId) return;
    const conversationId = "68330651292d9fe78abc6485";

    const dataMessage: dataMessage = {
      conversationId,
      senderId: userId,
      content: newMessage,
      type: "text",
    };

    // messageService.sendMessage(dataMessage);

    socketRef.current?.emit("send_message", dataMessage)

    setNewMessage("");
  };
// return /
  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Chats</h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="flex items-center space-x-3 py-3">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/40" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
              <span>Alice</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center space-x-3 py-3">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/41" />
                <AvatarFallback>BO</AvatarFallback>
              </Avatar>
              <span>Bob</span>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b bg-white">
          <h3 className="text-lg font-semibold">Alice</h3>
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
              
            })
            }
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
