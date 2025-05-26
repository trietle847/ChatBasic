import createAPI from "./createAPI.service";

export interface LoginData {
  tendangnhap: string;
  password: string;
}

export interface RegisterData {
  hoten: string,
  tendangnhap: string,
  password: string,
  email: string,
  sdt: string,
}
const userService = {
  login: async (data: LoginData) => {
    const response = await createAPI.post("user/login", data);
    return response.data; 
  },

  register: async(data: RegisterData) => {
    const response = await createAPI.post("/user", data);
    return response.data;
  }
}

export default userService;