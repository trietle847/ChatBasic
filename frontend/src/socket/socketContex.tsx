// src/socketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_SERVER_URL = "https://chatbasic-backend.onrender.com"; //"http://localhost:3000";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on("receive_friend_request", () => {
      if (
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Bạn có Thông báo mới", {
          body: "Ai đó vừa gửi yêu cầu kết bạn!",
        });
      } else {
        toast("Bạn có lời kết bạn mới", {
          description: "Bạn vừa nhận được một lời kết bạn",
          duration: 5000,
        });
      }
    });

    // Khi đóng tab hoặc reload, socket sẽ tự disconnect
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): Socket | null => {
  return useContext(SocketContext);
};
