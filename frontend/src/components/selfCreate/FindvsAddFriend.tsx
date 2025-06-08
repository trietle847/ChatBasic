import { useEffect, useState } from "react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserPlus } from "@fortawesome/free-solid-svg-icons";

import userService from "@/services/user.service";
import FriendService from "@/services/friend.service";

type Props = {
  open: boolean;
  onClose: () => void;
};

type User = {
  _id: string;
  tendangnhap: string;
  hoten: string;
};

const AddFriendModal = ({ open, onClose }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);


  useEffect(() => {
    if (!open) {
        setSearchTerm("");
        setResults([]);
    }
  }, [open])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await userService.searchUserByPhone(searchTerm);
      console.log(res)
      setResults([res.user]); 
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (receiverId: string) => {
    try {
      setAddingId(receiverId);
      await FriendService.sendRequestAddFriend(receiverId);
      alert("Đã gửi lời mời kết bạn!");
    } catch (err) {
      console.error("Add friend error:", err);
      alert("Gửi lời mời thất bại.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm bạn</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nhập số điện thoại hoặc username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </div>

        {!loading && results.length === 0 && searchTerm.trim() !== "" ? (
          <p className="text-sm text-gray-400">Không có kết quả.</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((user) => (
              <li
                key={user._id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{user.hoten}</p>
                  <p className="text-sm text-gray-500">@{user.tendangnhap}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleAddFriend(user._id)}
                  disabled={addingId === user._id}
                >
                  {addingId === user._id ? (
                    <span className="text-xs">Đang gửi...</span>
                  ) : (
                    <FontAwesomeIcon icon={faUserPlus} />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
        <DialogClose asChild>
          <div className="flex justify-end mt-4">
            <Button variant="destructive">Đóng</Button>
          </div>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
