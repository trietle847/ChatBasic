import { useEffect, useState } from "react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";

import FriendService from "@/services/friend.service";
import UserService from "@/services/user.service";
import conversationService from "@/services/conversation.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

interface User {
  _id: string;
  tendangnhap: string;
  hoten: string;
  avatar: string;
}

interface Friend {
  user: User;
}

const CreateGroup = ({ open, onClose }: Props) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (!open) {
      setGroupName("");
      setSelectedIds([]);
    }
  }, [open]);

  useEffect(() => {
    const fetchFriends = async () => {
      const ids = await FriendService.getMyFriend();
      const data = ids.result;
      const promises = data.map((f: string) => UserService.findUserById(f));
      const results = await Promise.all(promises);
      setFriends(results);
    };
    if (open) fetchFriends();
  }, [open]);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    try {
      const result = await conversationService.createConversation({
        name: groupName,
        memberIds: selectedIds,
        type: "group",
      });
      console.log(result);
      onClose();
      setGroupName("");
      setSelectedIds([]);
    } catch (error) {
      console.error("Lỗi tạo nhóm:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo nhóm</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Nhập tên nhóm..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <ScrollArea className="max-h-60 pr-2">
            {friends.map((friend) => (
              <div
                key={friend.user._id}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 px-2 rounded-md"
                onClick={() => handleSelect(friend.user._id)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(friend.user._id)}
                  readOnly
                />
                <img
                  src={
                    friend.user.avatar ||
                    `https://ui-avatars.com/api/?name=${friend.user.hoten}`
                  }
                  alt={friend.user.hoten}
                  className="w-8 h-8 rounded-full"
                />
                <span>{friend.user.hoten}</span>
              </div>
            ))}
          </ScrollArea>

          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleCreateGroup}
            disabled={!groupName || selectedIds.length === 0}
          >
            Tạo nhóm
          </Button>

          <DialogClose asChild>
            <div className="flex justify-end">
              <Button variant="destructive">Đóng</Button>
            </div>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
