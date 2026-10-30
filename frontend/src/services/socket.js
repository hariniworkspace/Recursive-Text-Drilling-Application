import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(
      import.meta.env.VITE_SOCKET_URL ||
        "http://localhost:5000",
      {
        autoConnect: false,
        transports: ["websocket"]
      }
    );
  }

  return socket;
}

export function connectSocket() {
  const client = getSocket();

  if (!client.connected) {
    client.connect();
  }

  return client;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}