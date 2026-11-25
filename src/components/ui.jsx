import { Info } from 'lucide-react'

export const Card = ({ className = '', children }) => (
  <section className={`min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 ${className}`}>{children}</section>
)

export function PageHeader({ crumbs, title, subtitle, actions }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400">{crumbs}</p>
        <h1 className="mt-1 break-words text-xl font-bold text-slate-900 sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
      </div>
      {actions && (
        // Mobile : les boutons d'action prennent toute la largeur ; à partir de sm : taille naturelle
        <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>*]:flex-1 [&>*]:justify-center sm:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </div>
  )
}

const tones = {
  green: 'bg-green-50 text-green-700',
  orange: 'bg-orange-50 text-orange-700',
  blue: 'bg-blue-50 text-blue-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  slate: 'bg-slate-100 text-slate-600',
}
export const Badge = ({ tone = 'slate', children }) => (
  <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${tones[tone] ?? tones.slate}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" /> {children}
  </span>
)

export const Notice = ({ children }) => (
  <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs text-slate-600 sm:px-4">
    <Info size={14} className="mt-0.5 shrink-0 text-primary" />
    <p className="min-w-0">{children}</p>
  </div>
)

export function StatCard({ icon: Icon, tone = 'blue', value, label, hint }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 transition duration-200 hover:shadow-md motion-safe:hover:-translate-y-0.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className={`shrink-0 rounded-md p-2 ${tones[tone] ?? tones.slate}`}><Icon size={14} /></span>
        <span className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{value}</span>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-700">{label}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

export const Pagination = ({ info }) => (
  <div className="mt-4 flex flex-col gap-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
    <span>{info}</span>
    <div className="flex items-center justify-between gap-2 sm:justify-end">
      <button className="min-h-10 rounded-md border border-slate-200 px-3 py-1.5 text-slate-500 sm:min-h-0">Précédent</button>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-white">1</span>
      <button className="min-h-10 rounded-md border border-slate-200 px-3 py-1.5 text-slate-500 sm:min-h-0">Suivant</button>
    </div>
  </div>
)

export const Th = ({ children, className = '' }) => (
  <th className={`whitespace-nowrap px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 ${className}`}>{children}</th>
)
