import { io, type Socket } from "socket.io-client";
import { env } from "./env";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(env.apiUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}
