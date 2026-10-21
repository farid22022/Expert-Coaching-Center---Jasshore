import { Inbox } from "lucide-react";
import AnimatedBookIllustration from "./AnimatedBookIllustration.jsx";

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className = "", animatedBook = false }) {
  return (
    <div className={`experience-empty campus-chrome-enter rounded-xl border border-dashed border-line bg-soft/60 p-8 text-center ${className}`}>
      {animatedBook ? <AnimatedBookIllustration className="mx-auto mb-3 h-40 w-56 max-w-full" /> : <img src={`/images/campus/${/result/i.test(title||'')?'empty-results':/assignment/i.test(title||'')?'empty-assignments':/notice/i.test(title||'')?'empty-notices':/search|filter|match/i.test(title||'')?'empty-search':'empty-courses'}.svg`} alt="" width="160" height="110" loading="lazy" className="mx-auto h-28 w-40 object-contain"/>}
      <span className="sr-only">
        <Icon size={22} />
      </span>
      {title && <p className="mt-3 font-black text-ink">{title}</p>}
      {description && <p className="mt-1 text-sm font-semibold text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
