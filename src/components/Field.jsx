import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Field({ label, hint, error, type = 'text', register, name, rules, ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <div className="relative mt-1">
        <input
          type={isPassword && show ? 'text' : type}
          {...register(name, rules)}
          {...props}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-[11px] text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  )
}