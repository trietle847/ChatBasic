// ===== 📁 pages/Home.tsx (SAU KHI FIX LỖI CUỘC GỌI KHÔNG HIỆN CHO NGƯỜI GỌI) =====
import ChatSidebar from "@/components/selfCreate/HomeChat/ChatSideBar";
import ChatHeader from "@/components/selfCreate/HomeChat/ChatHeader";
import ChatMessages from "@/components/selfCreate/HomeChat/ChatMessage";
import ChatInput from "@/components/selfCreate/HomeChat/ChatInput";
import Sidebar from "@/components/selfCreate/sidebar";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocket } from "@/socket/socketContex";
import { CallOverlay } from "@/components/selfCreate/CallScreen";
import { useEffect, useRef, useState } from "react";
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
  file?: string;
  type: "text" | "file" | "image" | "video" | "system";
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

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [callInfo, setCallInfo] = useState<{
    channel: string;
    incoming?: boolean;
    conversationId?: string;
    callerId?: string;
  } | null>(null);

  const socket = useSocket();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const me = await userService.getMe();
        setUserId(me.user._id);
        const response = await conversationService.getConversation();
        const dataConvs = response.data.conversations;

        const updateDataConvs = await Promise.all(
          dataConvs.map(async (conv: Conversation) => {
            if (conv.type === "private") {
              const otherUser = conv.members.find((m) => m._id !== me.user._id);
              if (otherUser) {
                try {
                  const otherRes = await userService.findUserById(
                    otherUser._id
                  );
                  return {
                    ...conv,
                    otherUser: otherRes.user.hoten,
                    Avatar: otherRes.user.avatar,
                  };
                } catch (error) {
                  return { ...conv, otherUser: "Unknown", error };
                }
              }
            }
            return conv;
          })
        );
        setConversations(updateDataConvs);
      } catch (error) {
        console.error("Lỗi khi load cuộc trò chuyện hoặc user:", error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket || !userId) return;

    socket.on("receive_call_request", ({channel, conversationId, from }) => {
      setCallInfo({ channel, incoming: true, conversationId, callerId: from });
    });

    socket.on(
      "call_response_result",
      ({ accepted, channel, conversationId }) => {
        if (accepted) {
          setCallInfo({ channel, incoming: false, conversationId });
        } else {
          alert("Cuộc gọi đã bị từ chối!");
          socket.emit("send_system_message", {
            conversationId,
            content: "Cuộc gọi đã bị tỮ chối.",
          });
        }
      }
    );

    return () => {
      socket.off("receive_call_request");
      socket.off("call_response_result");
    };
  }, [socket, userId]);

  useEffect(() => {
    if (!currentConversation || !socket) return;
    socket.on("receive_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket?.off("receive_message");
    };
  }, [currentConversation, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = (conversation: Conversation) => {
    if (!socket) return;
    const idcon: ListMessage = { conversationId: conversation._id };
    messageService
      .getMessage(idcon)
      .then((data) => {
        setMessages(data.messages);
        socket.emit("join_room", conversation._id);
      })
      .catch((err) => {
        console.error(
          "Không lấy được message:",
          err.response?.data || err.message
        );
      });
  };

  const handleSend = () => {
    if (!newMessage.trim() || !userId || !currentConversation) return;
    const data: dataMessage = {
      conversationId: currentConversation._id,
      senderId: userId,
      content: newMessage,
      type: "text",
    };
    socket?.emit("send_message", data);
    setNewMessage("");
  };

  const handleSelectConversation = (conv: Conversation) => {
    setCurrentConversation(conv);
    setMessages([]);
    loadMessages(conv);
  };

  const handleFileSend = async (file: File) => {
    if (!file || !userId || !currentConversation) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", currentConversation._id);
    formData.append("senderId", userId);
    formData.append("type", "file");
    try {
      const res = await messageService.uploadFile(formData);
      socket?.emit("send_message", res.message);
    } catch (err) {
      console.error("Lỗi upload file:", err);
    }
  };

  const handleCall = () => {
    if (!currentConversation || !userId) return;
    const otherUser = currentConversation.members.find((m) => m._id !== userId);
    const channel = `call-${Date.now()}`;
    socket?.emit("call_request", {
      to: otherUser?._id,
      from: userId,
      channel,
      conversationId: currentConversation._id,
    });
  };

  const handleCallResponse = (accept: boolean) => {
    if (!callInfo || !callInfo.callerId || !callInfo.conversationId) return;
    socket?.emit("call_response", {
      to: callInfo.callerId,
      accepted: accept,
      channel: callInfo.channel,
      conversationId: callInfo.conversationId,
    });
    if (!accept) {
      setCallInfo(null);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar />
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversation?._id || null}
        onSelectConversation={handleSelectConversation}
      />
      <div className="flex-1 flex flex-col">
        <ChatHeader
          conversation={currentConversation}
          userId={userId}
          onCall={handleCall}
        />
        <ScrollArea className="flex-1 overflow-y-auto">
          <ChatMessages
            messages={messages}
            userId={userId}
            bottomRef={bottomRef}
          />
        </ScrollArea>
        <ChatInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSend}
          onFileSend={handleFileSend}
        />
      </div>
      {callInfo && (
        <CallOverlay
          channel={callInfo.channel}
          incoming={callInfo.incoming}
          onClose={() => setCallInfo(null)}
          onAccept={() => handleCallResponse(true)}
          onReject={() => handleCallResponse(false)}
          conversationId={callInfo.conversationId}
          callerId={callInfo.callerId}
        />
      )}
    </div>
  );
}
