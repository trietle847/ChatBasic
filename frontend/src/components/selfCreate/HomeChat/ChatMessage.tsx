import MessageItem from "@/components/selfCreate/HomeChat/MessageItem";

interface Message {
  _id: string;
  senderId: { _id: string; hoten?: string; email?: string } | string;
  content: string;
  file?: string;
  type: "text" | "file" | "image" | "video";
}

interface Props {
  messages: Message[];
  userId: string | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessages({ messages, userId, bottomRef }: Props) {
  return (
    <div className="flex flex-col p-6 space-y-4">
      {messages.map((msg, index) => (
        <MessageItem key={index} msg={msg} userId={userId} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
