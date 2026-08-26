/**
 * components/notifications/NotificationDropdown.jsx
 * Dropdown panel showing recent notifications with mark-as-read.
 */
import { formatDistanceToNow } from "date-fns";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

const typeConfig = {
  order: { icon: FaCheckCircle, color: "text-green-500" },
  order_status: { icon: FaInfoCircle, color: "text-blue-500" },
  payment: { icon: FaCheckCircle, color: "text-green-500" },
  stock: { icon: FaExclamationTriangle, color: "text-yellow-500" },
  stock_alert: { icon: FaTimesCircle, color: "text-red-500" },
};

export default function NotificationDropdown({
  notifications,
  onNotificationClick,
  onMarkAllRead,
  onClearAll,
}) {
  if (notifications.length === 0) {
    return (
      <div className="w-80 p-6 text-center">
        <FaBell className="mx-auto mb-2 h-8 w-8 text-ink-300 dark:text-ink-600" />
        <p className="text-sm text-ink-500 dark:text-ink-400">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="w-80 max-h-96 overflow-hidden">
      <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-700 px-4 py-3">
        <span className="text-sm font-semibold text-ink-800 dark:text-ink-200">Notifications</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.slice(0, 20).map((n) => {
          const config = typeConfig[n.type] || typeConfig.order_status;
          const Icon = config.icon;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => onNotificationClick(n)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-50 dark:hover:bg-ink-700 ${
                !n.read ? "bg-brand-50/40 dark:bg-brand-900/20" : ""
              }`}
            >
              <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${config.color}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${!n.read ? "font-medium text-ink-900 dark:text-ink-100" : "text-ink-600 dark:text-ink-400"}`}>
                  {n.message}
                </p>
                <p className="mt-0.5 text-xs text-ink-400 dark:text-ink-500">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
