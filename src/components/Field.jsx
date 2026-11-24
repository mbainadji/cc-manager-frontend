import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Field({ label, hint, error, type = 'text', register, name, rules, ...props }) {
  const [show, setShow] = useState(false)
  const autoId = useId()
  const id = props.id ?? autoId
  const isPassword = type === 'password'

  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-700">{label}</label>
      <div className="relative mt-1">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={error ? true : undefined}
          {...register(name, rules)}
          {...props}
          className={`min-h-11 w-full rounded-md border bg-white px-3 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 sm:min-h-0 sm:py-2 sm:text-sm ${isPassword ? 'pr-11' : ''} ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/20'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-slate-400 hover:text-slate-600"
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
