import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowUpDown, Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, PageHeader, Notice, Badge, Th } from '../components/ui'
import Pager from '../components/Pager'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'
import { fmtDate } from '../format'
import { readStudentFile } from '../parseStudentList'

const PER_PAGE = 10
const MAX_ROWS = 2000
const MAX_FILE = 5 * 1024 * 1024
const select = 'rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600'

export default function Students() {
  const toast = useToast()
  const [students, setStudents] = useState(null) // null = chargement
  const [exams, setExams] = useState([])
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [reg, setReg] = useState('all')
  const [examId, setExamId] = useState('all')
  const [asc, setAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [grades, setGrades] = useState({}) // studentId -> { score, comment }

  const [resetTarget, setResetTarget] = useState(null)
  const [tempPassword, setTempPassword] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [file, setFile] = useState(null) // { name, students, ignored, headerFound }
  const [fileError, setFileError] = useState('')
  const [reading, setReading] = useState(false)

  const load = () =>
    Promise.all([api.get('/students'), api.get('/exams')])
      .then(([s, e]) => { setStudents(s.data); setExams(e.data); setError('') })
      .catch((err) => { setStudents((cur) => cur ?? []); setError(errorMessage(err)) })

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (examId === 'all') { setGrades({}); return }
    let cancelled = false
    api.get(`/exams/${examId}/grades`)
      .then(({ data }) => { if (!cancelled) setGrades(Object.fromEntries(data.map((g) => [g.studentId, g]))) })
      .catch((err) => { if (!cancelled) { setGrades({}); setError(errorMessage(err)) } })
    return () => { cancelled = true }
  }, [examId])

  const titleOf = (id) => exams.find((e) => e.id === id)?.title
  const currentExam = examId === 'all' ? null : exams.find((e) => e.id === examId)

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (students ?? [])
      .filter((s) => !term || `${s.matricule} ${s.fullName}`.toLowerCase().includes(term))
      .filter((s) => reg === 'all' || (reg === 'yes') === s.registered)
      .filter((s) => examId === 'all' || s.examIds.includes(examId))
      .sort((a, b) => (asc ? 1 : -1) * a.fullName.localeCompare(b.fullName, 'fr'))
  }, [students, q, reg, examId, asc])

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const current = Math.min(page, pages)
  const rows = list.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const onChange = (setter) => (e) => { setter(e.target.value); setPage(1) }
  const registeredCount = (students ?? []).filter((s) => s.registered).length

  // ---- Import depuis un fichier ----
  const pickFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = '' // permet de rechoisir le même fichier
    if (!f) return
    setFileError('')
    setFile(null)
    setReading(true)
    try {
      if (f.size > MAX_FILE) throw new Error('Fichier trop volumineux (5 Mo maximum).')
      const result = await readStudentFile(f)
      if (!result.students.length)
        throw new Error('Aucun étudiant trouvé. Le fichier doit avoir une colonne « Matricule » et une colonne « Nom ».')
      if (result.students.length > MAX_ROWS)
        throw new Error(`Trop d'étudiants (${result.students.length}). Maximum ${MAX_ROWS} par import : découpez le fichier.`)
      setFile({ name: f.name, ...result })
    } catch (err) {
      setFileError(err.message || 'Lecture du fichier impossible.')
    } finally {
      setReading(false)
    }
  }

  const closeImport = () => {
    if (busy || reading) return
    setImportOpen(false)
    setFile(null)
    setFileError('')
  }

  const runImport = async () => {
    setBusy(true)
    try {
      const { data } = await api.post('/students/import', { students: file.students })
      toast('success', `${data.created} ajouté(s), ${data.updated} mis à jour, ${data.skipped} déjà présent(s)${data.ignored ? `, ${data.ignored} ignoré(s)` : ''}.`)
      setBusy(false)
      closeImport()
      await load()
    } catch (err) {
      toast('error', errorMessage(err))
      setBusy(false)
    }
  }

  // ---- Mot de passe provisoire ----
  const resetPassword = async () => {
    setBusy(true)
    try {
      const { data } = await api.post(`/students/${resetTarget.id}/reset-password`)
      setTempPassword(data.password)
    } catch (err) {
      toast('error', errorMessage(err))
      setResetTarget(null)
    } finally {
      setBusy(false)
    }
  }

  const closeReset = () => {
    if (busy) return
    setResetTarget(null)
    setTempPassword('')
  }

  // ---- Suppression (étudiant sans compte) ----
  const removeStudent = async () => {
    setBusy(true)
    try {
      await api.delete(`/students/${deleteTarget.id}`)
      setDeleteTarget(null)
      toast('success', 'Étudiant supprimé de la liste.')
      await load()
    } catch (err) {
      toast('error', errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        crumbs="Espace professeur / Liste des étudiants"
        title="Liste des étudiants"
        subtitle={`${students?.length ?? 0} étudiants dans la liste · ${registeredCount} inscrits sur la plateforme`}
        actions={
          <button onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">
            <Upload size={14} /> Importer une liste
          </button>
        }
      />

      <Notice>
        Seuls les étudiants de cette liste peuvent créer un compte, avec le nom et le matricule indiqués ici.
        « Pas encore inscrit » veut dire que le compte n'est pas créé : vous pouvez déjà saisir sa note, il la verra dès son inscription.
      </Notice>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <Card className="mt-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={onChange(setQ)} placeholder="Rechercher par matricule ou par nom"
              className="w-full rounded-md border border-slate-200 py-2.5 pl-8 pr-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <select value={reg} onChange={onChange(setReg)} className={select}>
            <option value="all">Toutes les inscriptions</option>
            <option value="yes">Inscrits sur la plateforme</option>
            <option value="no">Pas encore inscrits</option>
          </select>
          <select value={examId} onChange={onChange(setExamId)} className={select}>
            <option value="all">Tous les examens</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-xs">
            <thead className="border-b border-slate-100">
              <tr>
                <Th>Matricule</Th>
                <Th>
                  <button onClick={() => setAsc(!asc)} className="flex items-center gap-1 uppercase">
                    Nom et prénom <ArrowUpDown size={11} />
                  </button>
                </Th>
                <Th>Inscription</Th>
                <Th>Examens associés</Th>
                {currentExam && <Th>Note</Th>}
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-500">{s.matricule}</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{s.fullName}</td>
                  <td className="px-3 py-3">
                    {s.registered
                      ? <Badge tone="green">Inscrit</Badge>
                      : <Badge tone="slate">Pas encore inscrit</Badge>}
                    {s.registered && <p className="mt-1 text-[10px] text-slate-400">le {fmtDate(s.createdAt)}</p>}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {s.examIds.length === 0 ? '—' : (
                      <>
                        {titleOf(s.examIds[0])}
                        {s.examIds.length > 1 && <span className="text-slate-400"> +{s.examIds.length - 1}</span>}
                      </>
                    )}
                  </td>
                  {currentExam && (
                    <td className="px-3 py-3">
                      {grades[s.id]?.score != null
                        ? <span className="font-medium text-slate-800">{grades[s.id].score}/{currentExam.maxScore}</span>
                        : <span className="text-slate-400">À saisir</span>}
                    </td>
                  )}
                  <td className="px-3 py-3">
                    {currentExam && (
                      <Link to={`/examens/${examId}/notes`} className="mr-4 font-medium text-primary hover:underline">
                        Modifier la note
                      </Link>
                    )}
                    {s.registered ? (
                      <button onClick={() => setResetTarget(s)} className="font-medium text-primary hover:underline">
                        Réinitialiser le mot de passe
                      </button>
                    ) : (
                      <button onClick={() => setDeleteTarget(s)} className="font-medium text-red-600 hover:underline">
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {students === null && <tr><td colSpan={currentExam ? 6 : 5} className="px-3 py-10 text-center text-slate-400">Chargement…</td></tr>}
              {students !== null && rows.length === 0 && (
                <tr><td colSpan={currentExam ? 6 : 5} className="px-3 py-10 text-center text-slate-400">
                  {students.length === 0
                    ? "La liste est vide. Importez un fichier pour que les étudiants puissent s'inscrire."
                    : 'Aucun étudiant ne correspond à votre recherche.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={current} pages={pages} total={list.length} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={importOpen} title="Importer une liste d'étudiants"
        confirmLabel={file ? `Importer ${file.students.length} étudiant(s)` : 'Importer'}
        onConfirm={() => file && runImport()} onClose={closeImport} loading={busy}>
        <p>
          Choisissez un fichier <strong>Excel (.xlsx)</strong> ou <strong>CSV</strong> depuis votre ordinateur ou votre téléphone.
          Il doit contenir une colonne <strong>Matricule</strong> et une ou plusieurs colonnes de nom
          (<strong>Nom</strong>, <strong>Prénom</strong>, ou <strong>Nom complet</strong>).
        </p>

        <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:bg-slate-100">
          {reading ? <Loader2 size={20} className="animate-spin text-primary" /> : <FileSpreadsheet size={20} className="text-primary" />}
          <span className="text-xs font-medium text-slate-700">
            {reading ? 'Lecture du fichier…' : file ? 'Choisir un autre fichier' : 'Choisir un fichier'}
          </span>
          <input type="file" className="sr-only" onChange={pickFile} disabled={reading || busy}
            accept=".xlsx,.csv,.txt,.tsv,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
        </label>

        {fileError && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-[11px] text-red-600">{fileError}</p>}

        {file && (
          <div className="mt-3">
            <p className="text-[11px] text-slate-600">
              <strong>{file.name}</strong> : {file.students.length} étudiant(s) trouvé(s)
              {file.ignored > 0 && `, ${file.ignored} ligne(s) ignorée(s) (matricule ou nom manquant)`}.
            </p>
            {!file.headerFound && (
              <p className="mt-1 text-[11px] text-orange-600">
                Pas d'en-tête « Matricule » / « Nom » détecté : la 1re colonne est lue comme matricule et la 2e comme nom. Vérifiez l'aperçu.
              </p>
            )}
            <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-slate-200">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-slate-50 text-left text-slate-500">
                  <tr><th className="px-3 py-1.5 font-medium">Matricule</th><th className="px-3 py-1.5 font-medium">Nom</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {file.students.slice(0, 8).map((s, i) => (
                    <tr key={i}><td className="px-3 py-1.5 text-slate-500">{s.matricule}</td><td className="px-3 py-1.5 text-slate-800">{s.fullName}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {file.students.length > 8 && <p className="mt-1 text-[10px] text-slate-400">… et {file.students.length - 8} autre(s).</p>}
            <p className="mt-2 text-[11px] text-slate-500">Un matricule déjà inscrit n'est pas modifié.</p>
          </div>
        )}
      </Modal>

      <Modal open={!!resetTarget} title="Réinitialiser le mot de passe ?"
        confirmLabel={tempPassword ? 'Fermer' : 'Réinitialiser'}
        onConfirm={tempPassword ? closeReset : resetPassword} onClose={closeReset} loading={busy}>
        {tempPassword ? (
          <>
            Nouveau mot de passe de {resetTarget?.fullName} : <strong className="select-all font-mono">{tempPassword}</strong>.
            Notez-le maintenant, il ne sera plus affiché. L'étudiant pourra le changer dans « Profil et paramètres ».
          </>
        ) : (
          <>Un mot de passe provisoire sera généré pour {resetTarget?.fullName}. L'ancien ne fonctionnera plus.</>
        )}
      </Modal>

      <Modal open={!!deleteTarget} title="Supprimer cet étudiant de la liste ?" confirmLabel="Supprimer"
        onConfirm={removeStudent} onClose={() => !busy && setDeleteTarget(null)} loading={busy}>
        {deleteTarget?.fullName} ({deleteTarget?.matricule}) et les notes déjà saisies pour lui seront supprimés.
      </Modal>
    </>
  )
}