import { useEffect, useState } from "react";
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
import userService from "@/services/user.service";

interface Conversation {
  _id: string;
  createdAt: string;
  type: string;
  name: string;
  members: User[];
  otherUser?: string;
  Avatar: string;
}


interface User {
  _id: string;
  tendangnhap: string;
  avatar: string;
  hoten: string;
}

interface Friend {
  user: User;
}

type Props = {
  onClose: () => void;
  conversation: Conversation;
  setConversation: (conv: Conversation) => void
};

export default function AddMembersModal({ onClose, conversation, setConversation }: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  //   const currentMemberIds = conversation.members.map((m) => m._id);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const ids = await FriendService.getMyFriend();
        const promises = ids.result.map((id: string) =>
          UserService.findUserById(id)
        );
        const results = await Promise.all(promises);
        
        setFriends(results);
      } catch (error) {
        console.error("Lỗi tải bạn bè:", error);
      }
    };

    fetchFriends();
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    try {
        const newMembers: User[] = [];

        for (const memberId of selectedIds) {
            await conversationService.addMember({
                conversationId: conversation._id,
                memberId,
            })

            const user = await userService.findUserById(memberId);
            console.log(user);
            newMembers.push(user.user);

            const updateCoversation: Conversation = {
                ...conversation,
                members: [...conversation.members, ...newMembers]
            }

            setConversation(updateCoversation)
        }
        onClose();
    } catch (error) {
        console.error(error);
    }
  }
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm thành viên vào nhóm</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-60 pr-2 space-y-2">
          {friends.map((friend) => {
            const isMember = conversation.members.some(
                (m) => m._id === friend.user._id
            );
            return (
              <div
                key={friend.user._id}
                className={`flex items-center gap-3 py-2 px-2 rounded-md ${
                  !isMember ? "cursor-pointer hover:bg-gray-100" : "opacity-50"
                }`}
                onClick={() => {
                  if (!isMember) toggleSelect(friend.user._id);
                }}
              >
                {!isMember ? (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(friend.user._id)}
                    readOnly
                  />
                ) : (
                  <span className="text-sm text-gray-500 ml-1">
                    Đã tham gia
                  </span>
                )}
                <img
                  src={
                    friend.user.avatar ||
                    `https://ui-avatars.com/api/?name=${friend.user.tendangnhap}`
                  }
                  alt={friend.user.tendangnhap}
                  className="w-8 h-8 rounded-full"
                />
                <span>{friend.user.tendangnhap}</span>
              </div>
            );
          })}
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleAdd} disabled={selectedIds.length === 0}>
            Thêm
          </Button>
          <DialogClose asChild>
            <Button variant="destructive">Đóng</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
