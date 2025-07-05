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
  getMessageById: async (messageId: string) => {
    const response = await createAPI.post("/message/get/byId", { messageId });
    return response.data;
  },
  sendMessage: async (data: dataMessage) => {
    const response = await createAPI.post("/message/text", data);

    return response.data;
  },
  uploadFile: async (data: FormData) => {
    const response = await createAPI.post("/message/upload/file", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getUnreadMap: async () => {
    const response = await createAPI.get("/message/get/unread");
    return response.data;
  }
};

export default messageService;
