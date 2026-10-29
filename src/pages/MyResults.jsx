import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CalendarDays } from 'lucide-react'
import { Card, PageHeader, Notice, Badge, Pagination, Th } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import api, { errorMessage } from '../api'
import { fmtDate } from '../format'

export default function MyResults() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [data, setData] = useState(null) // null = chargement
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    api.get('/results')
      .then((res) => alive && setData(res.data))
      .catch((err) => { if (alive) { setData([]); setError(errorMessage(err)) } })
    return () => { alive = false }
  }, [])

  const results = params.has('vide') ? [] : (data ?? []) // /resultats?vide pour voir l'état vide

  return (
    <>
      <PageHeader
        crumbs="Espace étudiant / Mes résultats"
        title="Mes résultats"
        subtitle={results.length
          ? 'Retrouvez vos notes publiées et les appréciations de vos professeurs.'
          : 'Retrouvez vos notes et les appréciations de vos professeurs.'}
      />

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-4">
          <Notice>Vos résultats sont strictement confidentiels. Chaque note affichée est visible uniquement par vous.</Notice>
          <Card className="flex items-center gap-3">
            <span className="rounded-md bg-blue-50 p-2 text-primary"><CheckCircle2 size={16} /></span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{results.length} résultats publiés</p>
              <p className="text-[11px] text-slate-400">Octobre 2026 · Année 2026-2027</p>
            </div>
          </Card>
        </div>
      )}

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-slate-900">Mes notes publiées</h2>
        <label className="mt-3 block text-[11px] font-medium text-slate-600">Période des examens</label>
        <select className="mt-1 w-44 rounded-md border border-slate-200 px-3 py-2 text-xs">
          <option>{results.length ? 'Octobre 2026' : 'Toutes les périodes'}</option>
        </select>

        {data === null && !params.has('vide') ? (
          <p className="mt-6 py-10 text-center text-xs text-slate-400">Chargement…</p>
        ) : results.length > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-xs">
                <thead className="border-b border-slate-100">
                  <tr><Th>Examen / matière</Th><Th>Commencé le</Th><Th>Publié le</Th><Th>Ma note</Th><Th>Détail</Th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-4">
                        <p className="font-medium text-slate-800">{r.title}</p>
                        <p className="text-[11px] text-slate-400">{r.subject}</p>
                        <span className="mt-1 inline-block"><Badge tone="green">Publié</Badge></span>
                      </td>
                      <td className="px-3 py-4 text-slate-500">{fmtDate(r.date)}</td>
                      <td className="px-3 py-4 text-slate-500">{fmtDate(r.publishedAt)}</td>
                      <td className="px-3 py-4 font-semibold text-slate-900">{r.score} / {r.max}</td>
                      <td className="px-3 py-4">
                        <Link to={`/resultats/${r.id}`} className="font-medium text-primary hover:underline">Voir le détail</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination info={`${results.length} résultats publiés · Page 1 sur 1`} />
          </>
        ) : (
          <div className="mt-6 grid place-items-center rounded-lg py-14 text-center">
            <span className="rounded-full bg-blue-50 p-4 text-primary"><CalendarDays size={22} /></span>
            <p className="mt-4 text-sm font-semibold text-slate-900">Aucun résultat publié pour le moment</p>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Vos résultats apparaîtront ici dès leur publication par vos professeurs. Vous pourrez alors consulter le détail de chaque résultat.
            </p>
            <p className="mt-3 text-[11px] text-slate-400">Votre matricule : {user?.matricule}</p>
          </div>
        )}
      </Card>

      {results.length === 0 && data !== null && (
        <div className="mt-4">
          <Notice>Vous n'avez aucune démarche à effectuer. Revenez dans cette page lorsqu'un professeur aura publié un résultat.</Notice>
        </div>
      )}
    </>
  )
}