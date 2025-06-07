import { faMessage, faAddressBook, faGears } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
  return (
    <div className="w-16 bg-[#0068FF] flex flex-col items-center py-4 space-y-4 text-white">
      <div
        onClick={() => navigate("/profile")}
        className="w-10 h-10 rounded-full overflow-hidden"
      >
        <img
          src="https://i.pravatar.cc/150?u=${conv._id}"
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
