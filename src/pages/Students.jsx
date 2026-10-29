import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowUpDown } from 'lucide-react'
import { Card, PageHeader, Notice, Th } from '../components/ui'
import Pager from '../components/Pager'
import api, { errorMessage } from '../api'
import { fmtDate } from '../format'

const PER_PAGE = 10
const select = 'rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600'

export default function Students() {
  const [students, setStudents] = useState(null) // null = chargement
  const [exams, setExams] = useState([])
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [examId, setExamId] = useState('all')
  const [asc, setAsc] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let alive = true
    Promise.all([api.get('/students'), api.get('/exams')])
      .then(([s, e]) => { if (alive) { setStudents(s.data); setExams(e.data) } })
      .catch((err) => { if (alive) { setStudents([]); setError(errorMessage(err)) } })
    return () => { alive = false }
  }, [])

  const titleOf = (id) => exams.find((e) => e.id === id)?.title

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (students ?? [])
      .filter((s) => !term || `${s.matricule} ${s.fullName}`.toLowerCase().includes(term))
      .filter((s) => examId === 'all' || s.examIds.includes(examId))
      .sort((a, b) => (asc ? 1 : -1) * a.fullName.localeCompare(b.fullName, 'fr'))
  }, [students, q, examId, asc])

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const current = Math.min(page, pages)
  const rows = list.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const onChange = (setter) => (e) => { setter(e.target.value); setPage(1) }

  return (
    <>
      <PageHeader
        crumbs="Espace professeur / Liste des étudiants"
        title="Liste des étudiants"
        subtitle={`${students?.length ?? 0} étudiants inscrits sur la plateforme`}
      />

      <Notice>
        Un étudiant apparaît ici dès qu'il crée son compte. « Examens associés » indique les examens auxquels il est rattaché.
      </Notice>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <Card className="mt-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={onChange(setQ)} placeholder="Rechercher par matricule ou par nom"
              className="w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={examId} onChange={onChange(setExamId)} className={select}>
            <option value="all">Tous les examens</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="border-b border-slate-100">
              <tr>
                <Th>Matricule</Th>
                <Th>
                  <button onClick={() => setAsc(!asc)} className="flex items-center gap-1 uppercase">
                    Nom et prénom <ArrowUpDown size={11} />
                  </button>
                </Th>
                <Th>Inscrit le</Th>
                <Th>Examens associés</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-500">{s.matricule}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{s.fullName}</td>
                  <td className="px-3 py-3 text-slate-500">{fmtDate(s.createdAt)}</td>
                  <td className="px-3 py-3 text-slate-600">
                    {s.examIds.length === 0 ? '—' : (
                      <>
                        {titleOf(s.examIds[0])}
                        {s.examIds.length > 1 && <span className="text-slate-400"> +{s.examIds.length - 1}</span>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {students === null && <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-400">Chargement…</td></tr>}
              {students !== null && rows.length === 0 && (
                <tr><td colSpan={4} className="px-3 py-10 text-center text-slate-400">
                  {students.length === 0 ? 'Aucun étudiant inscrit pour le moment.' : 'Aucun étudiant ne correspond à votre recherche.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={current} pages={pages} total={list.length} perPage={PER_PAGE} onChange={setPage} />
      </Card>
    </>
  )
}