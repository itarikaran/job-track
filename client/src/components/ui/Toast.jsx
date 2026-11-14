import { useEffect } from "react";

export function Toast({ toast, onRemove }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(onRemove, 4000);
    return () => clearTimeout(timeout);
  }, [toast, onRemove]);

  if (!toast) return null;

  const bgColor = toast.type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="fixed top-5 right-5 z-50" role="status" aria-live="polite">
      <div className={`px-4 py-3 rounded text-white shadow-lg ${bgColor} animate-in fade-in slide-in-from-right-2 duration-300`}>
        {toast.type === "success" ? "✓" : "✗"} {toast.message}
      </div>
    </div>
  );
}