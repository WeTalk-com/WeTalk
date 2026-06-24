import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socket.io/notifications",
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}
