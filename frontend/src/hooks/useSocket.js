import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_ORIGIN } from "../api";

export function useSocket(token, apartmentId, onAvailabilityChanged) {
  const latestCallback = useRef(onAvailabilityChanged);
  const socketRef = useRef(null);

  useEffect(() => {
    latestCallback.current = onAvailabilityChanged;
  });

  useEffect(() => {
    if (!token) return;

    const socket = io(API_ORIGIN || window.location.origin, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    function handleAvailabilityChanged() {
      const handler = latestCallback.current;
      if (typeof handler === "function") {
        handler();
      }
    }

    socket.on("availabilityChanged", handleAvailabilityChanged);

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!socketRef.current || !apartmentId) return;
    socketRef.current.emit("subscribe", apartmentId);
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("unsubscribe", apartmentId);
      }
    };
  }, [apartmentId]);
}
