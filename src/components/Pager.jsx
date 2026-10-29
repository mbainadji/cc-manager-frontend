export default function Pager({ page, pages, total, perPage, onChange }) {
  const from = total ? (page - 1) * perPage + 1 : 0
  const to = Math.min(page * perPage, total)
  const btn = 'rounded-md border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40'
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
      <span>{from} à {to} sur {total}</span>
      <div className="flex items-center gap-2">
        <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>Précédent</button>
        <span>Page {page} sur {pages}</span>
        <button className={btn} disabled={page >= pages} onClick={() => onChange(page + 1)}>Suivant</button>
      </div>
    </div>
  )
}