/**
 * hooks/useNotifications.js
 * Listens to Socket.IO events and manages notification state.
 * Shows toast notifications, tracks unread count, and syncs with server.
 * Notifications are loaded lazily — only when the bell is first opened.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import notificationApi from "../services/notificationApi";
import useAuth from "./useAuth";

const MAX_NOTIFICATIONS = 50;

export default function useNotifications() {
  const { socket, ensureConnected } = useSocket();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const listenersRef = useRef({});

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || isLoaded) return;
    try {
      const data = await notificationApi.list({ limit: 20 });
      if (data?.notifications) {
        setNotifications(
          data.notifications.map((n) => ({
            id: n._id,
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            link: n.link,
            data: n.data,
            createdAt: n.createdAt,
          }))
        );
        setUnreadCount(data.unreadCount || 0);
      }
      setIsLoaded(true);
      ensureConnected();
    } catch (_err) {
      // ignore
    }
  }, [isAuthenticated, isLoaded, ensureConnected]);

  const addNotification = useCallback((notification) => {
    const entry = {
      id: Date.now() + Math.random(),
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [entry, ...prev].slice(0, MAX_NOTIFICATIONS));
    setUnreadCount((prev) => prev + 1);
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    if (typeof id === "string" && id.length === 24) {
      notificationApi.markAsRead(id).catch(() => {});
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    notificationApi.markAllAsRead().catch(() => {});
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    notificationApi.clearAll().catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket || !isLoaded) return;

    const handlers = {
      "order:created": (data) => {
        toast.success(data.message || "Order placed successfully!");
        addNotification({ type: "order", ...data });
      },
      "order:statusChanged": (data) => {
        const statusColors = {
          processing: "info",
          shipped: "success",
          delivered: "success",
          cancelled: "error",
        };
        const toastFn = statusColors[data.order?.status] === "error" ? toast.error
          : statusColors[data.order?.status] === "success" ? toast.success
          : toast;
        toastFn(data.message || "Order status updated");
        addNotification({ type: "order_status", ...data });
      },
      "order:cancelled": (data) => {
        toast.error(data.message || "Order cancelled");
        addNotification({ type: "order", ...data });
      },
      "payment:confirmed": (data) => {
        toast.success(data.message || "Payment confirmed!");
        addNotification({ type: "payment", ...data });
      },
      "payment:failed": (data) => {
        toast.error(data.message || "Payment failed");
        addNotification({ type: "payment", ...data });
      },
      "payment:expired": (data) => {
        toast.error(data.message || "Payment session expired");
        addNotification({ type: "payment", ...data });
      },
      "stock:updated": (data) => {
        addNotification({ type: "stock", ...data });
      },
      "stock:low": (data) => {
        toast.warning(data.message || "Low stock alert");
        addNotification({ type: "stock_alert", ...data });
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
      listenersRef.current[event] = handler;
    });

    return () => {
      Object.keys(listenersRef.current).forEach((event) => {
        socket.off(event, listenersRef.current[event]);
      });
      listenersRef.current = {};
    };
  }, [socket, isLoaded, addNotification]);

  const handleNotificationClick = useCallback(
    (notification) => {
      markAsRead(notification.id);
      if (notification.link) {
        navigate(notification.link);
      } else if (notification.type === "order" || notification.type === "order_status") {
        const orderId = notification.data?.orderId || notification.order?._id;
        if (orderId) navigate(`/orders/${orderId}`);
      } else if (notification.type === "stock" || notification.type === "stock_alert") {
        navigate("/admin/inventory");
      } else if (notification.type === "payment") {
        const orderId = notification.data?.orderId || notification.order?._id;
        if (orderId) navigate(`/orders/${orderId}`);
      }
    },
    [markAsRead, navigate]
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    handleNotificationClick,
    loadNotifications,
  };
}
