import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

interface Props {
  newMessage: string;
  setNewMessage: (val: string) => void;
  onSend: () => void;
  onFileSend: (file: File) => void;
}

export default function ChatInput({
  newMessage,
  setNewMessage,
  onSend,
  onFileSend,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSend(file);
      e.target.value = ""; // reset input
    }
  };

  return (
    <div className="p-4 border-t bg-white flex gap-2">
      <Input
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
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
      <Button onClick={onSend}>Send</Button>
    </div>
  );
}
