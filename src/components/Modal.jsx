import { Loader2 } from 'lucide-react'

export default function Modal({ open, title, children, confirmLabel = 'Confirmer', onConfirm, onClose, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <div className="mt-2 text-sm text-slate-600">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} disabled={loading}
            className="rounded-md border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {loading && <Loader2 size={14} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}