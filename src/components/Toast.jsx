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
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 space-y-2">
        {items.map(({ id, type, message }) => {
          const [bg, Icon] = styles[type]
          return (
            <div key={id} className={`flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-medium text-white shadow-lg ${bg}`}>
              <Icon size={14} /> {message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}