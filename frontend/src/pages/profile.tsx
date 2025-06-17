import { useEffect, useRef, useState } from "react";
import userService from "@/services/user.service";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/selfCreate/sidebar";
import { Upload } from "lucide-react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen
} from "@fortawesome/free-solid-svg-icons";


interface User {
  _id: string;
  hoten: string;
  email: string;
  sdt:string;
  tendangnhap: string;
  avatar: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editField, setEditField] = useState<null | keyof User>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await userService.getMe();
        setUser(me.user);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  const handleEdit = (field: keyof User) => {
    setEditField(field);
    if (user) setEditValue(user[field] as string);
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!user || !editField) return;
    try {
      await userService.updateUser({ [editField]: editValue });
      setUser({ ...user, [editField]: editValue });
      setEditField(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploadingAvatar(true);
      const res = await userService.updateAvatar(formData);
      setUser({ ...user, avatar: res.avatar });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-500">Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 justify-center items-center">
        <Card className="w-full max-w-md p-6 shadow-xl rounded-xl bg-white">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <img
                src={user.avatar || "https://via.placeholder.com/150"}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border"
              />
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                title="Đổi ảnh đại diện"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            {isUploadingAvatar && (
              <p className="text-sm text-gray-500">Đang tải ảnh...</p>
            )}

            <div className="w-full space-y-3">
              {/* Họ tên */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Họ tên</label>
                  {editField === "hoten" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <Input disabled value={user.hoten} />
                  )}
                </div>
                {editField === "hoten" ? (
                  <div className="flex items-center gap-1 self-end mb-1">
                    <Button size="sm" onClick={handleSave}>
                      Lưu
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="self-end mb-1"
                    title="edit"
                    onClick={() => handleEdit("hoten")}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </Button>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Email</label>
                  {editField === "email" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <Input disabled value={user.email} />
                  )}
                </div>
                {editField === "email" ? (
                  <div className="flex items-center gap-1 self-end mb-1">
                    <Button size="sm" onClick={handleSave}>
                      Lưu
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="self-end mb-1"
                    title="edit"
                    onClick={() => handleEdit("email")}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Số điện thoại</label>
                  {editField === "sdt" ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  ) : (
                    <Input disabled value={user.sdt} />
                  )}
                </div>
                {editField === "sdt" ? (
                  <div className="flex items-center gap-1 self-end mb-1">
                    <Button size="sm" onClick={handleSave}>
                      Lưu
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="self-end mb-1"
                    title="edit"
                    onClick={() => handleEdit("sdt")}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
