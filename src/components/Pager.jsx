export default function Pager({ page, pages, total, perPage, onChange }) {
  const from = total ? (page - 1) * perPage + 1 : 0
  const to = Math.min(page * perPage, total)
  const btn = 'min-h-10 rounded-md border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 sm:min-h-0'
  return (
    <div className="mt-4 flex flex-col gap-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>{from} à {to} sur {total}</span>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>Précédent</button>
        <span className="whitespace-nowrap">Page {page} sur {pages}</span>
        <button className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>Suivant</button>
      </div>
    </div>
  )
}
