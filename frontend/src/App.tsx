import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/login";
import RegisterForm from "./pages/register";
import HomePage from "./pages/home_simple_chat"
import ListFriendPage from "./pages/friend/FriendPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/friend" element={<ListFriendPage/>} />
    </Routes>
  );
}

export default App;
