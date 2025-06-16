import userService from "@/services/user.service";
import { faMessage, faAddressBook, faGears } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const [avatarUrl, setAvataUrl] = useState<string|null>(null);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const me = await userService.getMe();
          setAvataUrl(me.user.avatar);
        } catch (error) {
          console.log(error);
        }
      };

      fetchUser();
    })
  return (
    <div className="w-16 bg-[#0068FF] flex flex-col items-center py-4 space-y-4 text-white">
      <div
        onClick={() => navigate("/profile")}
        className="w-10 h-10 rounded-full overflow-hidden"
      >
        <img
          src={avatarUrl || "https://via.placeholder.com/150"}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      <button
        onClick={() => navigate("/")}
        className="hover:bg-[#0050cc] w-10 h-10 flex items-center justify-center rounded-lg"
      >
        <FontAwesomeIcon icon={faMessage} />
      </button>

      <button
        onClick={() => navigate("/friend")}
        className="hover:bg-[#0050cc] w-10 h-10 flex items-center justify-center rounded-lg"
      >
        <FontAwesomeIcon icon={faAddressBook} />
      </button>

      <button
        onClick={() => navigate("/setting")}
        className="hover:bg-[#0050cc] w-10 h-10 flex items-center justify-center rounded-lg mt-auto"
      >
        <FontAwesomeIcon icon={faGears} />
      </button>
    </div>
  );
};

export default Sidebar;
