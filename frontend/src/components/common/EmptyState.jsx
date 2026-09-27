import { Inbox } from "lucide-react";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = "" }) {
  return (
    <div className={`rounded-xl border border-dashed border-line bg-soft/60 p-8 text-center ${className}`}>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-muted shadow-sm">
        <Icon size={22} />
      </span>
      {title && <p className="mt-3 font-black text-ink">{title}</p>}
      {description && <p className="mt-1 text-sm font-semibold text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
