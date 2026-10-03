import api from "./api.js";

// Notifications are navigation/awareness only. Where one leads comes from structured fields the
// backend stored (target_type/target_id/target_url), never from parsing its text, and only
// internal paths are followed - a notification can never send the user to an external URL.
const isInternalPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !/^\/+[a-z][a-z0-9+.-]*:/i.test(value);

export function resolveNotificationTarget(notification) {
  if (!notification) return null;
  if (notification.target_type === "ONLINE_TEST" && notification.target_id) return `/student/tests/${notification.target_id}`;
  if (isInternalPath(notification.target_url)) return notification.target_url;
  return null;
}

export const notificationsChanged = () => window.dispatchEvent(new Event("notificationschange"));

// Safe interaction order: navigate immediately; marking read is fire-and-forget so a failed
// request can never block navigation. The badge refreshes through the `notificationschange`
// event once the server confirms (and `onRead` lets the caller update its own list optimistically).
export function openNotification(notification, navigate, { onRead, fallback } = {}) {
  const target = resolveNotificationTarget(notification) || fallback || null;
  if (!notification.is_read) {
    onRead?.(notification);
    api.post(`/sms/notifications/${notification.id}/read/`).then(notificationsChanged).catch(() => {});
  }
  if (target) navigate(target);
}
