export function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmText = "Confirm" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative z-10">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}