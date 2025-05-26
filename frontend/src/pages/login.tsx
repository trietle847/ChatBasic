import { useState } from "react";
import { Link } from "react-router-dom";
import userService from "@/services/user.service";
import type { LoginData } from "@/services/user.service";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [tendangnhap, setTendangnhap] = useState("");
  const [password, setPassword] = useState("");
//   const navigate = useNavigate();

  const handleLogin = async () => {
    if (!tendangnhap || !password) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const loginData: LoginData = { tendangnhap, password };

    try {
      const res = await userService.login(loginData);
      console.log("token", res.token);
      alert("Đăng nhập thành công");
    //   navigate("/");
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        alert("Lỗi đăng nhập: " + (err.response?.data?.message || "Không xác định"));
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          ĐĂNG NHẬP
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="tendangnhap" className="text-gray-700">
              Tên đăng nhập
            </Label>
            <Input
              id="tendangnhap"
              type="text"
              value={tendangnhap}
              onChange={(e) => setTendangnhap(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full mt-4">
            Đăng nhập
          </Button>
        </form>

        <div className="text-sm text-center text-gray-500 mt-4 space-y-1">
          <p>
            <Link to="/forget" className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </Link>
          </p>
          <p>
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
