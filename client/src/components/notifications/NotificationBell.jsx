/**
 * components/notifications/NotificationBell.jsx
 * Bell icon with unread count badge. Toggles the notification dropdown.
 * Notifications are loaded lazily on first open.
 */
import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import useNotifications from "../../hooks/useNotifications";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications,
    handleNotificationClick,
    loadNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    loadNotifications();
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen, loadNotifications]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="navbar__link relative"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 shadow-lg">
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={(n) => {
              handleNotificationClick(n);
              setIsOpen(false);
            }}
            onMarkAllRead={markAllAsRead}
            onClearAll={clearNotifications}
          />
        </div>
      )}
    </div>
  );
}
