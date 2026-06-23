"use client";

import { useState, useEffect, useCallback } from "react";
import { getSocket } from "./socket";
import { getUnreadCount } from "./api/notifications";

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadCount()
      .then(setCount)
      .catch(() => {});

    const socket = getSocket();
    if (!socket) return;

    function onNewNotification() {
      setCount((c) => c + 1);
    }

    socket.on("notification:new", onNewNotification);
    socket.connect();

    return () => {
      socket.off("notification:new", onNewNotification);
    };
  }, []);

  return { count };
}
