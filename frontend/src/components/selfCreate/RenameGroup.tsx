import { useState } from "react";
import { Button } from "../ui/button";

interface RenameGroupModalProp {
  intialName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export default function RenameGroupModal({
  intialName,
  onSave,
  onClose,
}: RenameGroupModalProp) {
  const [name, setName] = useState(intialName);

  const handleSubmit = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-[90%] max-w-md z-50">
        <h2 className="text-lg font-semibold mb-4">Đổi tên nhóm</h2>
        <input
          type="text"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhóm mới"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Lưu</Button>
        </div>
      </div>
    </div>
  );
}
