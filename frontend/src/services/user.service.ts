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
    const response = await createAPI.post("/user/login", data);

    const token = response.data.token;
    localStorage.setItem("token", token);

    return response.data; 
  },

  register: async(data: RegisterData) => {
    const response = await createAPI.post("/user", data);
    return response.data;
  },

  getMe: async() => {
    // const token = localStorage.getItem("token");
    const response = await createAPI.get("/user/me");
    return response.data;
  },

  findUserById: async(id: string) => {
    const response = await createAPI.get(`/user/find/${id}`)
    return response.data;
  },
  searchUserByPhone: async(phone: string) => {
    const response = await createAPI.post("/user/search/phone", {phone})
    return response.data;
  }
}

export default userService;