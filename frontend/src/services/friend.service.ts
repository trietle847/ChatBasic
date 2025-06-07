import createAPI from "./createAPI.service";

const FriendService = {
    getMyFriend: async() => {
        const response = await createAPI.get("/friend/myFriend")
        return response.data;
    },
    getRequestAddFriend: async() => {
        const response = await createAPI.get("/friend/requestAddFriend")
        return response.data;
    } 
}

export default FriendService