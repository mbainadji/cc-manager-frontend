import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PencilLine, AlertCircle, BarChart3, TrendingDown, TrendingUp, FileDown, Search, Info, Loader2 } from 'lucide-react'
import { Card, PageHeader, StatCard, Badge, Th } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastContext'
import useMediaQuery from '../useMediaQuery'
import api, { errorMessage } from '../api'
import { STATUS_LABEL, fmtDate } from '../format'
import { exportCsv, exportExcel, exportPdf } from '../exportGrades'

const ranges = [
  { label: '< 50 %', test: (p) => p < 0.5 },
  { label: '50 – 59 %', test: (p) => p >= 0.5 && p < 0.6 },
  { label: '60 – 79 %', test: (p) => p >= 0.6 && p < 0.8 },
  { label: '80 – 100 %', test: (p) => p >= 0.8 },
]

const fmtNum = (n) => String(Math.round(n * 100) / 100).replace('.', ',')

export default function ExamResults() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [exam, setExam] = useState(null)
  const [grades, setGrades] = useState([])
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [exporting, setExporting] = useState('') // '', 'pdf' ou 'excel'

  useEffect(() => {
    let alive = true
    Promise.all([api.get(`/exams/${id}`), api.get(`/exams/${id}/grades`)])
      .then(([e, g]) => { if (alive) { setExam(e.data); setGrades(g.data) } })
      .catch((err) => alive && setError(err.response?.status === 404 ? 'Examen introuvable.' : errorMessage(err)))
    return () => { alive = false }
  }, [id])

  const stats = useMemo(() => {
    const max = exam?.maxScore ?? 20
    const notes = grades.filter((g) => g.score !== null).map((g) => g.score)
    return {
      max,
      notes,
      missing: grades.length - notes.length,
      avg: notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : null,
      min: notes.length ? Math.min(...notes) : null,
      top: notes.length ? Math.max(...notes) : null,
      dist: ranges.map((r) => ({ ...r, count: notes.filter((n) => r.test(n / max)).length })),
    }
  }, [exam, grades])

  const rows = grades.filter((g) => `${g.matricule} ${g.fullName}`.toLowerCase().includes(q.trim().toLowerCase()))

  const payload = () => ({ exam, grades, max: stats.max, teacher: `Pr. ${user?.name ?? ''}` })

  const run = async (kind, fn) => {
    setExporting(kind)
    try {
      await fn(payload())
    } catch {
      toast('error', "L'export a échoué. Réessayez.")
    } finally {
      setExporting('')
    }
  }

  if (error) return <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
  if (!exam) return <p className="py-10 text-center text-xs text-slate-400">Chargement…</p>

  const published = exam.status === 'published'
  const maxCount = Math.max(...stats.dist.map((d) => d.count), 1)
  const exportBtn = 'flex min-h-10 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 sm:min-h-0'
  const emptyText = grades.length === 0 ? 'Aucun étudiant inscrit pour le moment.' : 'Aucun étudiant trouvé.'
  const noteText = (g) =>
    g.score === null ? <span className="text-orange-600">Non saisie</span> : `${fmtNum(g.score)} / ${stats.max}`
  const stateBadge = (g) =>
    g.score === null ? <Badge tone="orange">À compléter</Badge> : <Badge tone="green">Enregistré</Badge>

  return (
    <>
      <PageHeader
        crumbs={`Espace professeur / ${exam.title} / Résultats`}
        title="Résultats d'examen"
        subtitle={published
          ? 'Notes publiées et statistiques de la classe.'
          : 'Consultez les notes enregistrées, puis complétez la saisie avant la publication.'}
      />

      <Card>
        <StatusBadge status={STATUS_LABEL[exam.status]} />
        <h2 className="mt-3 break-words text-lg font-bold text-slate-900">{exam.title}</h2>
        <p className="text-xs text-slate-400">
          {exam.subject} · {fmtDate(exam.date)} · Pr. {user?.name} · Barème sur {stats.max} · {grades.length} étudiants
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-md bg-blue-50 p-3 text-[11px] text-slate-600">
          <Info size={13} className="mt-0.5 shrink-0 text-primary" />
          <p>
            {published
              ? `Publié le ${fmtDate(exam.publishedAt)} : chaque étudiant voit uniquement sa propre note.`
              : 'Non publié : ces résultats sont consultables par le professeur uniquement.'}
          </p>
        </div>
        <Link to={`/examens/${id}/notes`}
          className="mt-4 flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 sm:inline-flex sm:min-h-0 sm:w-auto">
          {published ? 'Corriger une note' : 'Saisir ou modifier les notes'}
        </Link>
      </Card>

      <div className="stagger mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        <StatCard icon={PencilLine} value={stats.notes.length} label="Notes enregistrées" hint={`Sur ${grades.length} étudiants`} />
        <StatCard icon={AlertCircle} tone="orange" value={stats.missing} label="Notes manquantes" hint="À compléter" />
        <StatCard icon={BarChart3} value={stats.avg === null ? '—' : `${fmtNum(stats.avg)} / ${stats.max}`} label="Moyenne de la classe" hint={`Sur ${stats.notes.length} notes`} />
        <StatCard icon={TrendingDown} tone="orange" value={stats.min === null ? '—' : `${fmtNum(stats.min)} / ${stats.max}`} label="Note la plus basse" />
        <div className="col-span-2 sm:col-span-1">
          <StatCard icon={TrendingUp} tone="green" value={stats.top === null ? '—' : `${fmtNum(stats.top)} / ${stats.max}`} label="Note la plus haute" />
        </div>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-slate-900">Distribution des notes</h2>
        <p className="text-[11px] text-slate-400">{stats.notes.length} notes disponibles · Effectif par intervalle (en % du barème)</p>
        <div className="mt-4 space-y-3">
          {stats.dist.map((d) => (
            <div key={d.label} className="flex items-center gap-3 text-[11px]">
              <span className="w-20 shrink-0 text-slate-500">{d.label}</span>
              <div className="h-4 min-w-0 flex-1 rounded bg-slate-100">
                <div className="h-4 origin-left rounded bg-primary motion-safe:animate-grow-x" style={{ width: `${(d.count / maxCount) * 100}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right font-medium text-slate-700">{d.count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-slate-900">Notes individuelles</h2>
        <p className="text-[11px] text-slate-400">{grades.length} étudiants · {stats.notes.length} notes enregistrées · {stats.missing} manquantes</p>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          <button onClick={() => exportCsv(payload())} disabled={grades.length === 0} className={exportBtn}>
            <FileDown size={14} /> CSV
          </button>
          <button onClick={() => run('pdf', exportPdf)} disabled={grades.length === 0 || !!exporting} className={exportBtn}>
            {exporting === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} PDF
          </button>
          <button onClick={() => run('excel', exportExcel)} disabled={grades.length === 0 || !!exporting} className={exportBtn}>
            {exporting === 'excel' ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Excel
          </button>
        </div>

        <div className="relative mt-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un étudiant…"
            className="min-h-11 w-full rounded-md border border-slate-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-primary sm:min-h-0" />
        </div>

        {isDesktop ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-xs">
              <thead className="border-b border-slate-100">
                <tr><Th>Matricule</Th><Th>Nom · Prénom</Th><Th>Note / barème</Th><Th>État de saisie</Th></tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr key={g.studentId} className={`border-b border-slate-100 ${g.score === null ? 'bg-orange-50' : ''}`}>
                    <td className="px-3 py-2.5 text-slate-500">{g.matricule}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{g.fullName}</td>
                    <td className="px-3 py-2.5 text-slate-700">{noteText(g)}</td>
                    <td className="px-3 py-2.5">{stateBadge(g)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-400">{emptyText}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="stagger mt-3 space-y-2">
            {rows.map((g) => (
              <li key={g.studentId} className={`rounded-lg border p-3 ${g.score === null ? 'border-orange-100 bg-orange-50' : 'border-slate-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium text-slate-800">{g.fullName}</p>
                    <p className="text-[11px] text-slate-500">{g.matricule}</p>
                  </div>
                  <div className="shrink-0">{stateBadge(g)}</div>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">{noteText(g)}</p>
              </li>
            ))}
            {rows.length === 0 && <li className="py-10 text-center text-xs text-slate-400">{emptyText}</li>}
          </ul>
        )}
      </Card>
    </>
  )
}
