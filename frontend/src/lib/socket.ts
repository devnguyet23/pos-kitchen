"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect inside useEffect to ensure it runs client-side
    const socketInstance = io("http://localhost:3001", {
       autoConnect: false
    });
    
    socketInstance.connect();

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket");
      setSocket(socketInstance);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
