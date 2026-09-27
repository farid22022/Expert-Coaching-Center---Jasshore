import { useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";

import api, { getApiErrorMessage } from "../../services/api.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentNotificationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/sms/notifications/")
      .then((response) => {
        const data = response.data?.data || response.data;
        setItems(Array.isArray(data) ? data : data?.results || []);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load notifications.")))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await api.post(`/sms/notifications/${notification.id}/read/`);
      setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)));
    } catch {
      // Non-critical - the item just stays unread if this fails.
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/sms/notifications/read_all/");
      setItems((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch {
      // Non-critical - items just stay as-is if this fails.
    }
  };

  const unreadCount = items.filter((item) => !item.is_read).length;

  return (
    <PortalPage title="Notifications">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-3">
          {unreadCount > 0 && (
            <button type="button" onClick={markAllRead} className="flex w-fit items-center gap-1 self-end text-sm font-bold text-emerald-700 hover:underline">
              <CheckCheck size={15} /> Mark all as read
            </button>
          )}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => markRead(item)}
              className={`rounded-xl border bg-white p-5 text-left shadow-sm ${item.is_read ? "border-slate-200" : "border-emerald-200"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-slate-950">{item.title}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-600">{item.body}</p>
                  <p className="mt-3 text-xs font-bold text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                {!item.is_read && <span className="badge badge-success text-white">New</span>}
              </div>
              {item.target_url && <a href={item.target_url} onClick={(event) => event.stopPropagation()} className="link link-success mt-3 inline-block font-bold">Open related item</a>}
            </button>
          ))}
          {!items.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No notifications yet.</p>}
        </div>
      )}
    </PortalPage>
  );
}
