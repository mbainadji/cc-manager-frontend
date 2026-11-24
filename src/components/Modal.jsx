import { useEffect, useId } from 'react'
import { Loader2 } from 'lucide-react'

// Mobile : panneau qui monte du bas de l'écran. À partir de md : fenêtre centrée.
export default function Modal({ open, title, children, confirmLabel = 'Confirmer', onConfirm, onClose, loading }) {
  const titleId = useId()

  // Échap pour fermer ; la page derrière ne défile plus tant que la fenêtre est ouverte
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose?.() }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open, loading, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center md:p-4"
      onClick={onClose} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="flex max-h-[90dvh] w-full flex-col rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl md:max-w-md md:rounded-xl md:p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-slate-200 md:hidden" />
        <h2 id={titleId} className="shrink-0 text-base font-semibold text-slate-900">{title}</h2>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto text-sm text-slate-600">{children}</div>
        <div className="mt-4 flex shrink-0 flex-col-reverse gap-2 md:mt-6 md:flex-row md:justify-end">
          <button onClick={onClose} disabled={loading}
            className="min-h-11 w-full rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 md:min-h-0 md:w-auto md:text-xs">
            Annuler
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 md:min-h-0 md:w-auto md:text-xs">
            {loading && <Loader2 size={14} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
