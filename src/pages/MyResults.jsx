import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CalendarDays, BarChart3 } from 'lucide-react'
import { Card, PageHeader, Notice, Badge, Th } from '../components/ui'
import Pager from '../components/Pager'
import { useAuth } from '../context/AuthContext'
import useMediaQuery from '../useMediaQuery'
import api, { errorMessage } from '../api'
import { fmtDate } from '../format'

const PER_PAGE = 8

const monthKey = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`
}
const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}
const fmtNum = (n) => String(Math.round(n * 100) / 100).replace('.', ',')

export default function MyResults() {
  const { user } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [params] = useSearchParams()
  const [data, setData] = useState(null) // null = chargement
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let alive = true
    api.get('/results')
      .then((res) => alive && setData(res.data))
      .catch((err) => { if (alive) { setData([]); setError(errorMessage(err)) } })
    return () => { alive = false }
  }, [])

  const all = params.has('vide') ? [] : (data ?? []) // /resultats?vide pour voir l'état vide

  const months = useMemo(() => [...new Set(all.map((r) => monthKey(r.date)))].sort().reverse(), [all])
  const results = period === 'all' ? all : all.filter((r) => monthKey(r.date) === period)

  // Moyenne ramenée sur 20, pondérée par les coefficients
  const average = results.length
    ? results.reduce((sum, r) => sum + (r.score / r.max) * 20 * (r.coef ?? 1), 0) / results.reduce((sum, r) => sum + (r.coef ?? 1), 0)
    : null

  const pages = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const current = Math.min(page, pages)
  const rows = results.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const loading = data === null && !params.has('vide')

  return (
    <>
      <PageHeader
        crumbs="Espace étudiant / Mes résultats"
        title="Mes résultats"
        subtitle={all.length
          ? 'Retrouvez vos notes publiées et les appréciations de vos professeurs.'
          : 'Retrouvez vos notes et les appréciations de vos professeurs.'}
      />

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      {all.length > 0 && (
        <div className="space-y-4">
          <Notice>Vos résultats sont strictement confidentiels. Chaque note affichée est visible uniquement par vous.</Notice>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Card className="flex items-center gap-3">
              <span className="shrink-0 rounded-md bg-blue-50 p-2 text-primary"><CheckCircle2 size={16} /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{results.length} résultat{results.length > 1 ? 's' : ''} publié{results.length > 1 ? 's' : ''}</p>
                <p className="text-[11px] text-slate-400">{period === 'all' ? 'Toutes les périodes' : monthLabel(period)}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="shrink-0 rounded-md bg-green-50 p-2 text-green-600"><BarChart3 size={16} /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{average === null ? '—' : `${fmtNum(average)} / 20`}</p>
                <p className="text-[11px] text-slate-400">Moyenne générale pondérée par les coefficients</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-slate-900">Mes notes publiées</h2>
        <label htmlFor="period" className="mt-3 block text-[11px] font-medium text-slate-600">Période des examens</label>
        <select id="period" value={period} onChange={(e) => { setPeriod(e.target.value); setPage(1) }}
          className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 py-2 text-xs capitalize sm:min-h-0 sm:w-52">
          <option value="all">Toutes les périodes</option>
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>

        {loading ? (
          <p className="mt-6 py-10 text-center text-xs text-slate-400">Chargement…</p>
        ) : results.length > 0 ? (
          <>
            {isDesktop ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-xs">
                  <thead className="border-b border-slate-100">
                    <tr><Th>Examen / matière</Th><Th>Passé le</Th><Th>Publié le</Th><Th>Ma note</Th><Th>Détail</Th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-4">
                          <p className="font-medium text-slate-800">{r.title}</p>
                          <p className="text-[11px] text-slate-400">{r.subject}</p>
                          <span className="mt-1 inline-flex gap-1">
                            <Badge tone="green">Publié</Badge>
                            {r.correctedAt && <Badge tone="blue">Corrigée</Badge>}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-slate-500">{fmtDate(r.date)}</td>
                        <td className="px-3 py-4 text-slate-500">{fmtDate(r.publishedAt)}</td>
                        <td className="px-3 py-4 font-semibold text-slate-900">{fmtNum(r.score)} / {r.max}</td>
                        <td className="px-3 py-4">
                          <Link to={`/resultats/${r.id}`} className="font-medium text-primary hover:underline">Voir le détail</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {rows.map((r) => (
                  <li key={r.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-slate-800">{r.title}</p>
                        <p className="text-[11px] text-slate-400">{r.subject}</p>
                      </div>
                      <p className="shrink-0 text-base font-semibold text-slate-900">{fmtNum(r.score)} / {r.max}</p>
                    </div>
                    <span className="mt-2 inline-flex gap-1">
                      <Badge tone="green">Publié</Badge>
                      {r.correctedAt && <Badge tone="blue">Corrigée</Badge>}
                    </span>
                    <dl className="mt-2 space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between gap-2"><dt>Passé le</dt><dd>{fmtDate(r.date)}</dd></div>
                      <div className="flex justify-between gap-2"><dt>Publié le</dt><dd>{fmtDate(r.publishedAt)}</dd></div>
                    </dl>
                    <Link to={`/resultats/${r.id}`}
                      className="mt-3 flex min-h-10 items-center justify-center rounded-md border border-primary/30 text-xs font-medium text-primary">
                      Voir le détail
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Pager page={current} pages={pages} total={results.length} perPage={PER_PAGE} onChange={setPage} />
          </>
        ) : all.length > 0 ? (
          <p className="mt-6 py-10 text-center text-xs text-slate-400">Aucun résultat pour cette période.</p>
        ) : (
          <div className="mt-6 grid place-items-center rounded-lg py-10 text-center sm:py-14">
            <span className="rounded-full bg-blue-50 p-4 text-primary"><CalendarDays size={22} /></span>
            <p className="mt-4 text-sm font-semibold text-slate-900">Aucun résultat publié pour le moment</p>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Vos résultats apparaîtront ici dès leur publication par vos professeurs. Vous pourrez alors consulter le détail de chaque résultat.
            </p>
            <p className="mt-3 text-[11px] text-slate-400">Votre matricule : {user?.matricule}</p>
          </div>
        )}
      </Card>

      {all.length === 0 && data !== null && (
        <div className="mt-4">
          <Notice>Vous n'avez aucune démarche à effectuer. Revenez dans cette page lorsqu'un professeur aura publié un résultat.</Notice>
        </div>
      )}
    </>
  )
}
