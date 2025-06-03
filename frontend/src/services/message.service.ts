import createAPI from "./createAPI.service";

export interface ListMessage {
  conversationId: string;
}

export interface dataMessage {
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
}

const messageService = {
  getMessage: async (data: ListMessage) => {
    const response = await createAPI.post("/message/get", data);

    return response.data;
  },
  sendMessage: async (data: dataMessage) => {
    const response = await createAPI.post("/message", data);

    return response.data;
  }
};

export default messageService;
