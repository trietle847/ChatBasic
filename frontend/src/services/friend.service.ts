import createAPI from "./createAPI.service";

const FriendService = {
  getMyFriend: async () => {
    const response = await createAPI.get("/friend/myFriend");
    return response.data;
  },
  getRequestAddFriend: async () => {
    const response = await createAPI.get("/friend/requestAddFriend");
    return response.data;
  },
  acceptRequest: async (idRequest: string) => {
    const response = await createAPI.put("/friend/accept",{idRequest});
    return response;
  },
  rejectRequest: async (idRequest: string) => {
    const response = await createAPI.delete("/friend/reject", {
      data: { idRequest },
    });
    return response;
  },
  getgroups: async () => {
    const response = await createAPI.get("/conversation/get/group")
    return response.data;
  }
};

export default FriendService