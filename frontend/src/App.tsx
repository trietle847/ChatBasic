import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/login";
import RegisterForm from "./pages/register";
import HomePage from "./pages/home_simple_chat"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterForm />} />
    </Routes>
  );
}

export default App;
