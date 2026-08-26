/**
 * context/SocketContext.jsx
 * Manages the Socket.IO connection lifecycle.
 * Connects lazily — only when a consumer first calls ensureConnected.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import useAuth from "../hooks/useAuth";
import baseURL from "../config/api";
import { storage } from "../services/axios";

const SocketContext = createContext(null);

const SERVER_URL = baseURL.replace(/\/api\/?$/, "");

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const connectedRef = useRef(false);

  const ensureConnected = useCallback(() => {
    if (connectedRef.current || !isAuthenticated) return;

    const token = storage.getAccess();
    if (!token) return;

    const socket = io(SERVER_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;
    connectedRef.current = true;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", () => setIsConnected(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      connectedRef.current = false;
      setIsConnected(false);
      return;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        connectedRef.current = false;
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      isConnected,
      ensureConnected,
    }),
    [isConnected, ensureConnected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}

export default SocketProvider;
