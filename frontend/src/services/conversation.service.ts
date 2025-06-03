import createAPI from "./createAPI.service";

const conversationService = {
    getConversation: async() => {
        const response = await createAPI.get("/conversation");
        return response;
    }
}

export default conversationService;