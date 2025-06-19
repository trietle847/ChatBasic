interface Message {
  _id: string;
  senderId: { _id: string; hoten?: string; email?: string } | string;
  content: string;
  file?: string;
  type: "text" | "file" | "image" | "video" | "system";
}

interface Props {
  msg: Message;
  userId: string | null;
}

export default function MessageItem({ msg, userId }: Props) {
  const sender =
    typeof msg.senderId === "string" ? msg.senderId : msg.senderId._id;
  const isMe = sender === userId;

  return (
    <div
      className={`flex ${isMe ? "justify-end" : "justify-start"} items-start`}
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
}
