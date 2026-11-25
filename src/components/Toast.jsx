import { useCallback, useState } from 'react'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { ToastContext } from './ToastContext'

const styles = {
  success: ['bg-green-600', CheckCircle2],
  error: ['bg-red-600', XCircle],
  info: ['bg-navy', Info],
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const push = useCallback((type, message) => {
    const id = Date.now() + Math.random()
    setItems((l) => [...l, { id, type, message }])
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      {/* Mobile : pleine largeur, au-dessus de la barre du bas. Ordinateur : en bas à droite. */}
      <div aria-live="polite"
        className="pointer-events-none fixed inset-x-3 bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] z-[60] flex flex-col items-stretch gap-2 lg:inset-x-auto lg:bottom-4 lg:right-4 lg:items-end">
        {items.map(({ id, type, message }) => {
          const [bg, Icon] = styles[type]
          return (
            <div key={id} className={`pointer-events-auto motion-safe:animate-toast-in flex max-w-md items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg lg:text-xs ${bg}`}>
              <Icon size={16} className="mt-0.5 shrink-0" /> <span className="min-w-0 break-words">{message}</span>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
