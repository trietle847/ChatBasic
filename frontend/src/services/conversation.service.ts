import createAPI from "./createAPI.service";

export interface GroupData {
    memberIds: string[];
    name: string;
    type: "group";
}

export interface RenameData {
  conversationId: string;
  name: string;
}
const conversationService = {
    getConversation: async() => {
        const response = await createAPI.get("/conversation");
        return response;
    },
    createConversation: async(data: GroupData) => {
        const response = await createAPI.post("/conversation", data);
        return response.data;
    },
    renameConversation: async(data: RenameData) => {
        const response = await createAPI.put("/conversation/renameConver", data
        );
        return response.data;
    }
}

export default conversationService;