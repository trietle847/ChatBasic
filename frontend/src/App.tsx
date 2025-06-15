import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/login";
import RegisterForm from "./pages/register";
import HomePage from "./pages/home_simple_chat";
import ListFriendPage from "./pages/friend/FriendPage";
import { AgoraProvider } from "@/context/AgoraContext";

import { SocketProvider } from "@/socket/socketContex";
import { Toaster } from "sonner";

function App() {
  return (
    <AgoraProvider>
      <SocketProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/friend" element={<ListFriendPage />} />
        </Routes>
      </SocketProvider>
    </AgoraProvider>
  );
}


export default App;
