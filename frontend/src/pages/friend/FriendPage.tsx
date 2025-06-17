import { useState } from "react";

import Sidebar from "@/components/selfCreate/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddFriendModal from "@/components/selfCreate/FindvsAddFriend";
import CreateGroupModal from "@/components/selfCreate/CreateGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUserPlus,
  faUserGroup,
  faUsers
} from "@fortawesome/free-solid-svg-icons";

import FriendsList from "./FriendList";
import RequestAddFriend from "./requestAddFriend"
import GroupList from "./GroupList"

const FriendPage = () => {
  const [activeTab, setActiveTab] = useState("friends")
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main sidebar */}
      <div className="w-1/3 bg-white p-6 border-r overflow-y-auto shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Bạn bè</h2>

        <div className="flex items-center mb-6 space-x-3">
          <div className="flex items-center flex-1 bg-gray-100 rounded-md px-2">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />{" "}
            <Input
              id="searchFriend"
              type="text"
              placeholder="Tìm kiếm"
              className="border-none shadow-none focus-visible:ring-0 focus:outline-none bg-transparent ml-2"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-100 transition"
            onClick={() => setModalOpen(true)}
          >
            <FontAwesomeIcon icon={faUserPlus} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-100 transition"
            onClick={() => setCreateGroupOpen(true)}
          >
            <FontAwesomeIcon icon={faUsers} />
          </Button>
        </div>

        <AddFriendModal
          open={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
        <CreateGroupModal
          open={isCreateGroupOpen}
          onClose={() => setCreateGroupOpen(false)}
        />

        {/* tab */}
        <div className="flex flex-col space-y-2">
          <Button
            className={`justify-start px-4 py-2 rounded-md border text-black hover:bg-blue-100 ${
              activeTab === "friends"
                ? "bg-blue-100 border-blue-500"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("friends")}
          >
            Danh sách bạn bè
          </Button>
          <Button
            className={`justify-start px-4 py-2 rounded-md border flex items-center gap-2 text-black hover:bg-blue-100 ${
              activeTab === "groups"
                ? "bg-blue-100 border-blue-500"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Danh sách các nhóm <FontAwesomeIcon icon={faUserGroup} />
          </Button>
          <Button
            className={`justify-start px-4 py-2 rounded-md border flex items-center gap-2 text-black hover:bg-blue-100 ${
              activeTab === "invites"
                ? "bg-blue-100 border-blue-500"
                : "bg-white"
            }`}
            onClick={() => setActiveTab("invites")}
          >
            Lời mời kết bạn <FontAwesomeIcon icon={faUserGroup} />
          </Button>
        </div>
      </div>

      {/* hiển thị giao diện bên phải */}
      <div className="flex-1 p-6">
        {activeTab === "friends" && <FriendsList />}
        {activeTab === "invites" && <RequestAddFriend />}
        {activeTab === "groups" && <GroupList />}
      </div>
    </div>
  );
};

export default FriendPage;
