import ChatSidebar from "@/components/selfCreate/HomeChat/ChatSideBar";
import ChatHeader from "@/components/selfCreate/HomeChat/ChatHeader";
import ChatMessages from "@/components/selfCreate/HomeChat/ChatMessage";
import ChatInput from "@/components/selfCreate/HomeChat/ChatInput";
import Sidebar from "@/components/selfCreate/sidebar";
import ChatInfo from "@/components/selfCreate/ChatInfo";

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
  conversationId: string;
  senderId: { _id: string; hoten?: string; email?: string } | string;
  content: string;
  file?: string;
  type: "text" | "file" | "image" | "video" | "system";
}

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
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  const socket = useSocket();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  //update conversation
  useEffect(() => {
    if (!socket || !userId) return;

    const handleUpdate = (
      updated: Conversation & { senderLastMessageId?: string }
    ) => {
      const senderName =
        updated.senderLastMessageId === userId
          ? "Bạn"
          : updated.senderLastMessage;

      const updatedWithLabel: Conversation = {
        ...updated,
        senderLastMessage: senderName,
      };

      setConversations((prev) => {
        // Xoá nếu tồn tại rồi chèn vào đầu danh sách
        const updatedList = prev.filter((c) => c._id !== updated._id);
        const newList = [updatedWithLabel, ...updatedList];

        // Sắp xếp lại danh sách theo thời gian mới nhất
        return newList.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      });

      if (currentConversation?._id === updated._id) {
        setCurrentConversation(updatedWithLabel);
      }
    };

    const handleRemove = ({ conversationId }: { conversationId: string }) => {
      setConversations((prev) => {
        const newList = prev.filter((conv) => conv._id !== conversationId);

        // Sắp xếp lại danh sách còn lại
        return newList.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      });

      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
        setShowInfoPanel(false);
      }
    };

    socket.on("conversation_updated", handleUpdate);
    socket.on("new_conversation", handleUpdate);
    socket.on("conversation_removed", handleRemove);

    return () => {
      socket.off("conversation_updated", handleUpdate);
      socket.off("new_conversation", handleUpdate);
      socket.off("conversation_removed", handleRemove);
    };
  }, [socket, userId, currentConversation]);

  // Load conversation
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const me = await userService.getMe();
        setUserId(me.user._id);

        const response = await conversationService.getConversation();
        const dataConvs = response.data.conversations;

        const updateDataConvs = await Promise.all(
          dataConvs.map(async (conv: Conversation) => {
            if (conv.lastMessage) {
              try {
                const messageRes = await messageService.getMessageById(
                  conv.lastMessage
                );
                conv.lastMessage = messageRes.message.content;

                const senderRes = await userService.findUserById(
                  messageRes.message.senderId
                );

                if (me.user._id === senderRes.user._id) {
                  conv.senderLastMessage = "Bạn";
                } else {
                  conv.senderLastMessage = senderRes.user.hoten;
                }
              } catch (error) {
                conv.lastMessage = `Lỗi: ${error}`;
              }
            }

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

        const sortedConvs = updateDataConvs.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA; // mới nhất lên đầu
        });
        setConversations(sortedConvs);

        updateDataConvs.forEach((conv) => {
          socket?.emit("join_room", conv._id);
        });
      } catch (error) {
        console.error("Lỗi khi load cuộc trò chuyện hoặc user:", error);
      }
    };

    fetchConversations();
  }, [socket]);

  // lấy tin nhắn chưa đọc
  useEffect(() => {
    if (!userId) return;
    const fetchUnreadMap = async () => {
      if (!userId) return;
      try {
        const res = await messageService.getUnreadMap();
        const map: Record<string, number> = {};
        Object.entries(res.data).forEach(([conversationId, unreadCount]) => {
          map[conversationId] = Number(unreadCount);
        });

        setUnreadMap(map);
      } catch (error) {
        console.error("Không lấy được unreadMap:", error);
      }
    };
    fetchUnreadMap();
  }, [userId]);

  // Gọi video
  useEffect(() => {
    if (!socket || !userId) return;

    socket.on("receive_call_request", ({ channel, conversationId, from }) => {
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
            content: "Cuộc gọi đã bị từ chối.",
          });
        }
      }
    );

    return () => {
      socket.off("receive_call_request");
      socket.off("call_response_result");
    };
  }, [socket, userId]);

  // Nhận tin nhắn
  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (message: Message) => {
      if (
        !currentConversation ||
        message.conversationId !== currentConversation._id
      ) {
        setUnreadMap((prev) => ({
          ...prev,
          [message.conversationId]: (prev[message.conversationId] || 0) + 1,
        }));
        return;
      }
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket?.off("receive_message");
    };
  }, [currentConversation, socket]);

  // Auto scroll khi có tin mới
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
    setShowInfoPanel(false); // Reset panel khi đổi cuộc trò chuyện

    // Reset số chưa đọc
    // setUnreadMap((prev) => ({
    //   ...prev,
    //   [conv._id]: 0,
    // }));

    // Emit mark as read
    socket?.emit("mark_as_read", {
      conversationId: conv._id,
      userId,
    });
  };

  // Lắng nghe sự kiện mark as read thành công từ server
  useEffect(() => {
    if (!socket) return;

    const handleMarkAsRead = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      setUnreadMap((prev) => ({
        ...prev,
        [conversationId]: 0,
      }));
    };

    socket.on("mark_as_read_success", handleMarkAsRead);

    return () => {
      socket.off("mark_as_read_success", handleMarkAsRead);
    };
  }, [socket]);

  const handleFileSend = async (file: File) => {
    if (!file || !userId || !currentConversation) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", currentConversation._id);
    // formData.append("senderId", userId);
    // formData.append("type", "file");
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
        unreadMap={unreadMap}
      />

      <div className="flex flex-1">
        {/* Phần trò chuyện (70% khi panel mở) */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            showInfoPanel ? "w-[70%]" : "w-full"
          }`}
        >
          <ChatHeader
            conversation={currentConversation}
            messages={messages}
            userId={userId}
            onCall={handleCall}
            onOpenInfo={() => setShowInfoPanel((prev) => !prev)}
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

        {/* Panel thông tin nhóm */}
        {showInfoPanel && currentConversation && (
          <div className="w-[30%] border-l bg-white">
            <ChatInfo
              conversation={currentConversation}
              messages={messages}
              onClose={() => setShowInfoPanel(false)}
            />
          </div>
        )}
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
