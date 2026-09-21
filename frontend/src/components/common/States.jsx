export function LoadingState() { return <div className="state">Loading information...</div>; }
export function EmptyState({ text = "No records available." }) { return <div className="state">{text}</div>; }
export function ErrorState({ text = "Something went wrong." }) { return <div className="state error">{text}</div>; }
