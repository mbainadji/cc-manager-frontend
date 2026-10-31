import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, ArrowUpDown, Save, Send, Loader2 } from 'lucide-react'
import { Card, Badge, Th } from '../components/ui'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'
import { fmtDate } from '../format'

const parse = (v) => (v.trim() === '' ? null : Number(v.replace(',', '.')))
const isInvalid = (v, max) => {
  const n = parse(v)
  return n !== null && (Number.isNaN(n) || n < 0 || n > max)
}

export default function GradeEntry() {
  const { id } = useParams()
  const toast = useToast()

  const [exam, setExam] = useState(null)
  const [students, setStudents] = useState([])
  const [loadError, setLoadError] = useState('')
  const [saved, setSaved] = useState({})
  const [values, setValues] = useState({})
  const [published, setPublished] = useState(false)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState({ key: 'matricule', asc: true })
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    let alive = true
    Promise.all([api.get(`/exams/${id}`), api.get(`/exams/${id}/grades`)])
      .then(([e, g]) => {
        if (!alive) return
        const init = Object.fromEntries(
          g.data.map((s) => [s.studentId, { score: s.score === null ? '' : String(s.score), comment: s.comment || '' }])
        )
        setExam(e.data)
        setStudents(g.data)
        setSaved(init)
        setValues(init)
        setPublished(e.data.status === 'published')
      })
      .catch((err) => alive && setLoadError(err.response?.status === 404 ? 'Examen introuvable.' : errorMessage(err)))
    return () => { alive = false }
  }, [id])

  const MAX = exam?.maxScore ?? 20
  const total = students.length
  const scoreOf = (s) => values[s.studentId]?.score ?? ''
  const invalidCount = students.filter((s) => isInvalid(scoreOf(s), MAX)).length
  const missing = students.filter((s) => scoreOf(s).trim() === '').length
  const filled = total - missing - invalidCount
  const changedRow = (s) =>
    values[s.studentId]?.score !== saved[s.studentId]?.score ||
    values[s.studentId]?.comment !== saved[s.studentId]?.comment
  const dirty = students.some(changedRow)
  const canPublish = !published && !dirty && filled > 0 && invalidCount === 0
  const status = published ? 'Publié' : canPublish && missing === 0 ? 'Prêt à publier' : filled === 0 ? 'Brouillon' : 'Saisie en cours'

  // Avertissement si on ferme l'onglet avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return students
      .filter((s) => !t || `${s.matricule} ${s.fullName}`.toLowerCase().includes(t))
      .sort((a, b) => (sort.asc ? 1 : -1) * String(a[sort.key]).localeCompare(String(b[sort.key]), 'fr'))
  }, [q, sort, students])

  const toggleSort = (key) => setSort((s) => ({ key, asc: s.key === key ? !s.asc : true }))

  const setField = (sid, field, value) =>
    setValues((p) => ({ ...p, [sid]: { ...p[sid], [field]: value } }))

  const onKey = (e, i) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); inputs.current[i + 1]?.focus() }
    if (e.key === 'ArrowUp') { e.preventDefault(); inputs.current[i - 1]?.focus() }
  }

  const save = async () => {
    if (invalidCount) return toast('error', `${invalidCount} note(s) invalide(s) : le barème est de ${MAX}.`)
    // Après publication, une note peut être corrigée mais pas retirée
    if (published && students.some((s) => changedRow(s) && scoreOf(s).trim() === '' && saved[s.studentId]?.score !== ''))
      return toast('error', 'Une note publiée peut être corrigée, pas retirée.')

    setBusy(true)
    try {
      const grades = students.filter(changedRow).map((s) => ({
        studentId: s.studentId,
        score: parse(values[s.studentId].score),
        comment: values[s.studentId].comment.trim(),
      }))
      await api.put(`/exams/${id}/grades`, { grades })
      setSaved(values)
      toast('success', published
        ? 'Corrections enregistrées : les étudiants voient la mise à jour.'
        : 'Modifications enregistrées.')
    } catch (err) {
      toast('error', errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    setBusy(true)
    try {
      await api.post(`/exams/${id}/publish`)
      setPublished(true)
      setConfirm(false)
      toast('success', 'Résultats publiés : les étudiants peuvent les consulter.')
    } catch (err) {
      toast('error', errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const btn = 'flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50'

  if (loadError) return <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{loadError}</p>
  if (!exam) return <p className="py-10 text-center text-xs text-slate-400">Chargement…</p>

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-400">Espace professeur / Saisie des notes</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{exam.title}</h1>
          <p className="mt-1 text-xs text-slate-500">
            {exam.subject} · {fmtDate(exam.date)} · Barème sur {MAX} · {total} étudiants ·{' '}
            <strong className="text-slate-700">{filled} notes saisies</strong> · {missing} manquantes
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un étudiant (matricule ou nom)"
            className="w-full rounded-md border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>

        {dirty && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600">
            <span className="h-2 w-2 rounded-full bg-orange-500" /> Modifications non enregistrées
          </span>
        )}

        <button onClick={save} disabled={!dirty || busy}
          className={`${btn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
          {busy && !confirm ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Enregistrer les modifications
        </button>
        {!published && (
          <button onClick={() => setConfirm(true)} disabled={!canPublish || busy}
            className={`${btn} bg-primary text-white hover:bg-blue-700`}>
            <Send size={14} /> Publier les résultats
          </button>
        )}
      </div>

      {!published && !canPublish && (
        <p className="mt-2 text-[11px] text-slate-400">
          Pour publier : enregistrez vos modifications et saisissez au moins une note valide (de 0 à {MAX}).
        </p>
      )}

      {published && (
        <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-[11px] text-slate-600">
          Résultats publiés : vous pouvez corriger une note ou une appréciation. L'étudiant verra « Note corrigée le … ». Une note publiée ne peut pas être retirée.
        </p>
      )}

      <Card className="mt-4 p-0">
        <div className="max-h-[62vh] overflow-auto">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <Th className="w-12">N°</Th>
                <Th>
                  <button onClick={() => toggleSort('matricule')} className="flex items-center gap-1 uppercase">
                    Matricule <ArrowUpDown size={11} />
                  </button>
                </Th>
                <Th>
                  <button onClick={() => toggleSort('fullName')} className="flex items-center gap-1 uppercase">
                    Nom et prénom <ArrowUpDown size={11} />
                  </button>
                </Th>
                <Th className="w-28">Note / {MAX}</Th>
                <Th>Appréciation</Th>
                <Th>Statut</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => {
                const v = scoreOf(s)
                const bad = isInvalid(v, MAX)
                const empty = v.trim() === ''
                const changed = changedRow(s)
                return (
                  <tr key={s.studentId} className={`border-t border-slate-100 ${empty ? 'bg-orange-50/60' : ''}`}>
                    <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2 text-slate-500">{s.matricule}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{s.fullName}</td>
                    <td className="px-3 py-1.5">
                      <input
                        ref={(el) => { inputs.current[i] = el }}
                        value={v}
                        inputMode="decimal"
                        aria-label={`Note de ${s.fullName}`}
                        onChange={(e) => setField(s.studentId, 'score', e.target.value)}
                        onKeyDown={(e) => onKey(e, i)}
                        onFocus={(e) => e.target.select()}
                        className={`w-16 rounded-md border px-2 py-1.5 text-right text-sm tabular-nums outline-none focus:ring-2 ${
                          bad ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-primary focus:ring-primary/20'
                        }`}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <input
                        value={values[s.studentId]?.comment ?? ''}
                        maxLength={500}
                        aria-label={`Appréciation pour ${s.fullName}`}
                        placeholder="Facultatif"
                        onChange={(e) => setField(s.studentId, 'comment', e.target.value)}
                        className="w-full min-w-40 rounded-md border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      {bad ? <span className="text-[11px] font-medium text-red-600">Entre 0 et {MAX}</span>
                        : empty ? <Badge tone="orange">À compléter</Badge>
                        : changed ? <Badge tone="blue">Modifiée</Badge>
                        : <Badge tone="green">Enregistrée</Badge>}
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-400">
                  {total === 0 ? 'Aucun étudiant inscrit pour le moment.' : 'Aucun étudiant trouvé.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={confirm} title="Publier les résultats ?" confirmLabel="Publier définitivement"
        onConfirm={publish} onClose={() => !busy && setConfirm(false)} loading={busy}>
        {filled} notes seront visibles par les étudiants concernés, chacun uniquement pour sa propre note.
        {missing > 0 && ` ${missing} étudiant(s) sans note ne verront rien.`} Vous pourrez ensuite corriger une note, mais pas la retirer.
      </Modal>
    </>
  )
}