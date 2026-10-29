import { Info } from 'lucide-react'

export const Card = ({ className = '', children }) => (
  <section className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>{children}</section>
)

export function PageHeader({ crumbs, title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[11px] text-slate-400">{crumbs}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}

const tones = {
  green: 'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  blue: 'bg-blue-50 text-blue-700',
  slate: 'bg-slate-100 text-slate-600',
}
export const Badge = ({ tone = 'slate', children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" /> {children}
  </span>
)

export const Notice = ({ children }) => (
  <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-slate-600">
    <Info size={14} className="mt-0.5 shrink-0 text-primary" />
    <p>{children}</p>
  </div>
)

export function StatCard({ icon: Icon, tone = 'blue', value, label, hint }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className={`rounded-md p-2 ${tones[tone]}`}><Icon size={14} /></span>
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-700">{label}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

export const Pagination = ({ info }) => (
  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
    <span>{info}</span>
    <div className="flex items-center gap-2">
      <button className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-500">Précédent</button>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-white">1</span>
      <button className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-500">Suivant</button>
    </div>
  </div>
)

export const Th = ({ children, className = '' }) => (
  <th className={`px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${className}`}>{children}</th>
)