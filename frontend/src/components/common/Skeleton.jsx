function Bar({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Bar key={index} className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-xl border border-line bg-white p-4 shadow-sm ${className}`}>
      <Bar className="h-5 w-1/3" />
      <SkeletonText lines={2} className="mt-3" />
    </div>
  );
}

export function SkeletonRow({ columns = 4 }) {
  return (
    <div className="grid gap-4 border-b border-line/70 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Bar key={index} className="h-4" />
      ))}
    </div>
  );
}

export default function Skeleton({ variant = "text", ...props }) {
  if (variant === "card") return <SkeletonCard {...props} />;
  if (variant === "row") return <SkeletonRow {...props} />;
  return <SkeletonText {...props} />;
}
