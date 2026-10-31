import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Card, PageHeader, Th, Notice } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import Pager from '../components/Pager'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'
import { STATUS_LABEL, fmtDate } from '../format'

const PER_PAGE = 6

const toRow = (e) => ({
  id: e.id,
  title: e.title,
  subject: e.subject,
  date: fmtDate(e.date),
  students: e.studentsCount,
  graded: e.gradedCount,
  status: STATUS_LABEL[e.status],
})

export default function ExamsList({ onlyPublished = false }) {
  const flash = useLocation().state?.flash
  const toast = useToast()
  const [exams, setExams] = useState(null) // null = chargement
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    api.get('/exams')
      .then((res) => alive && setExams(res.data.map(toRow)))
      .catch((err) => alive && setError(errorMessage(err)))
    return () => { alive = false }
  }, [])

  const remove = async () => {
    setBusy(true)
    try {
      await api.delete(`/exams/${toDelete.id}`)
      setExams((list) => list.filter((e) => e.id !== toDelete.id))
      setToDelete(null)
      toast('success', 'Examen supprimé.')
    } catch (err) {
      toast('error', errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const list = (exams ?? []).filter(
    (e) =>
      (!onlyPublished || e.status === 'Publié') &&
      (status === 'all' || e.status === status) &&
      `${e.title} ${e.subject}`.toLowerCase().includes(q.toLowerCase())
  )
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const current = Math.min(page, pages)
  const rows = list.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  return (
    <>
      <PageHeader
        crumbs={`Espace professeur / ${onlyPublished ? 'Résultats publiés' : 'Mes examens'}`}
        title={onlyPublished ? 'Résultats publiés' : 'Mes examens'}
        subtitle={onlyPublished ? 'Les examens dont les notes sont visibles par les étudiants.' : 'Tous vos examens, quel que soit leur statut.'}
        actions={
          <Link to="/examens/nouveau" className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">
            <Plus size={14} /> Créer un examen
          </Link>
        }
      />

      {flash && <div className="mb-4"><Notice>{flash}</Notice></div>}

      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Rechercher par titre ou matière…"
              className="w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          {!onlyPublished && (
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
              <option value="all">Tous les statuts</option>
              <option>Brouillon</option><option>Saisie en cours</option><option>Prêt à publier</option><option>Publié</option>
            </select>
          )}
        </div>

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-xs">
            <thead className="border-b border-slate-100">
              <tr><Th>Titre de l'examen</Th><Th>Date</Th><Th>Étudiants</Th><Th>Notes saisies</Th><Th>Statut</Th><Th>Action</Th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800">{e.title}</p>
                    <p className="text-[11px] text-slate-400">{e.subject}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{e.date}</td>
                  <td className="px-3 py-3 text-slate-500">{e.students}</td>
                  <td className="px-3 py-3 text-slate-600">{e.graded}/{e.students}</td>
                  <td className="px-3 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {e.status === 'Publié'
                        ? <>
                            <Link to={`/examens/${e.id}/resultats`} className="font-medium text-primary hover:underline">Résultats</Link>
                            <Link to={`/examens/${e.id}/notes`} className="font-medium text-primary hover:underline">Corriger</Link>
                          </>
                        : <Link to={`/examens/${e.id}/notes`} className="font-medium text-primary hover:underline">Saisir les notes</Link>}
                      <Link to={`/examens/${e.id}/modifier`} className="font-medium text-slate-600 hover:underline">Modifier</Link>
                      {e.status !== 'Publié' && (
                        <button onClick={() => setToDelete(e)} className="font-medium text-red-600 hover:underline">Supprimer</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {exams === null && !error && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-400">Chargement…</td></tr>
              )}
              {exams !== null && rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-400">Aucun examen trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={current} pages={pages} total={list.length} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={!!toDelete} title="Supprimer cet examen ?" confirmLabel="Supprimer"
        onConfirm={remove} onClose={() => !busy && setToDelete(null)} loading={busy}>
        « {toDelete?.title} » et toutes les notes saisies seront supprimés. Cette action est définitive.
      </Modal>
    </>
  )
}