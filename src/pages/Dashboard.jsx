import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Users, PencilLine, CheckCircle2, Plus, Search } from 'lucide-react'
import { Card, PageHeader, StatCard, Pagination, Th } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import api, { errorMessage } from '../api'
import { STATUS_LABEL, fmtDate } from '../format'

export default function Dashboard() {
  const [exams, setExams] = useState(null) // null = chargement
  const [studentsCount, setStudentsCount] = useState(0)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    let alive = true
    Promise.all([api.get('/exams'), api.get('/students')])
      .then(([e, s]) => {
        if (!alive) return
        setExams(e.data)
        setStudentsCount(s.data.length)
      })
      .catch((err) => { if (alive) { setExams([]); setError(errorMessage(err)) } })
    return () => { alive = false }
  }, [])

  const all = exams ?? []
  const published = all.filter((e) => e.status === 'published').length
  const toPublish = all.length - published

  const filtered = all.filter(
    (e) =>
      (status === 'all' || e.status === status) &&
      `${e.title} ${e.subject}`.toLowerCase().includes(q.toLowerCase())
  )
  const recent = filtered.slice(0, 6)

  return (
    <>
      <PageHeader
        crumbs="Espace professeur / Tableau de bord"
        title="Tableau de bord"
        subtitle="Une vue claire de vos évaluations et de la publication des résultats."
      />

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={FileText} value={all.length} label="Examens créés" hint="Au total" />
        <StatCard icon={Users} tone="blue" value={studentsCount} label="Étudiants inscrits" hint="Sur la plateforme" />
        <StatCard icon={PencilLine} tone="orange" value={toPublish} label="Examens à publier" hint="Brouillon, saisie ou prêts" />
        <StatCard icon={CheckCircle2} tone="green" value={published} label="Examens publiés" hint="Résultats visibles" />
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Examens récents</h2>
            <p className="text-xs text-slate-400">Suivez la saisie et la publication de vos examens.</p>
          </div>
          <Link to="/examens/nouveau" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus size={14} /> Créer un examen
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par titre ou matière…"
              className="w-full rounded-md border border-slate-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-primary" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600">
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="border-b border-slate-100">
              <tr><Th>Titre de l'examen</Th><Th>Date</Th><Th>Étudiants</Th><Th>Notes saisies</Th><Th>Statut</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((e) => {
                const pct = e.studentsCount ? (e.gradedCount / e.studentsCount) * 100 : 0
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <Link to={`/examens/${e.id}/resultats`} className="font-medium text-slate-800 hover:text-primary">{e.title}</Link>
                      <p className="text-[11px] text-slate-400">{e.subject}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{fmtDate(e.date)}</td>
                    <td className="px-3 py-3 text-slate-500">{e.studentsCount}</td>
                    <td className="px-3 py-3">
                      <span className="text-slate-600">{e.gradedCount}/{e.studentsCount}</span>
                      <div className="mt-1 h-1 w-20 rounded bg-slate-100">
                        <div className={`h-1 rounded ${pct >= 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={STATUS_LABEL[e.status]} /></td>
                  </tr>
                )
              })}
              {exams === null && <tr><td colSpan={5} className="px-3 py-10 text-center text-slate-400">Chargement…</td></tr>}
              {exams !== null && recent.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-10 text-center text-slate-400">
                  {all.length === 0 ? 'Aucun examen pour le moment. Créez votre premier examen.' : 'Aucun examen trouvé.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination info={`${recent.length} sur ${filtered.length} examens · Voir tous dans « Mes examens »`} />
      </Card>
    </>
  )
}