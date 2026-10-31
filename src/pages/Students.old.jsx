import { useEffect, useMemo, useState } from 'react'
import { Search, ArrowUpDown, Upload } from 'lucide-react'
import { Card, PageHeader, Notice, Badge, Th } from '../components/ui'
import Pager from '../components/Pager'
import Modal from '../components/Modal'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'
import { fmtDate } from '../format'

const PER_PAGE = 10
const select = 'rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600'

// Une ligne par étudiant : "matricule;nom" (séparateur ; , ou tabulation). Une ligne d'en-tête est ignorée.
const parseList = (text) => {
  const rows = []
  let invalid = 0
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue
    const parts = line.split(/[;\t,]/).map((p) => p.trim().replace(/^"|"$/g, ''))
    if (parts[0].toLowerCase() === 'matricule') continue
    const [matricule, ...rest] = parts
    const fullName = rest.join(' ').trim()
    if (!matricule || !fullName) { invalid++; continue }
    rows.push({ matricule, fullName })
  }
  return { rows, invalid }
}

// CSV d'Excel français : parfois en Windows-1252 plutôt qu'en UTF-8
const readFile = async (file) => {
  const buf = await file.arrayBuffer()
  let text = new TextDecoder('utf-8').decode(buf)
  if (text.includes('\uFFFD')) text = new TextDecoder('windows-1252').decode(buf)
  return text.replace(/^\uFEFF/, '')
}

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

  const [resetTarget, setResetTarget] = useState(null)
  const [tempPassword, setTempPassword] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () =>
    Promise.all([api.get('/students'), api.get('/exams')])
      .then(([s, e]) => { setStudents(s.data); setExams(e.data); setError('') })
      .catch((err) => { setStudents((cur) => cur ?? []); setError(errorMessage(err)) })

  useEffect(() => { load() }, [])

  const titleOf = (id) => exams.find((e) => e.id === id)?.title
  const parsed = useMemo(() => parseList(text), [text])

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

  const pickFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) setText(await readFile(file))
  }

  const runImport = async () => {
    setBusy(true)
    try {
      const { data } = await api.post('/students/import', { students: parsed.rows })
      toast('success', `${data.created} ajouté(s), ${data.updated} mis à jour, ${data.skipped} déjà présent(s)${data.ignored ? `, ${data.ignored} ignoré(s)` : ''}.`)
      setImportOpen(false)
      setText('')
      await load()
    } catch (err) {
      toast('error', errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

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
                  <td className="px-3 py-3">
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
              {students === null && <tr><td colSpan={5} className="px-3 py-10 text-center text-slate-400">Chargement…</td></tr>}
              {students !== null && rows.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-10 text-center text-slate-400">
                  {students.length === 0
                    ? 'La liste est vide. Importez les étudiants pour qu\'ils puissent s\'inscrire.'
                    : 'Aucun étudiant ne correspond à votre recherche.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={current} pages={pages} total={list.length} perPage={PER_PAGE} onChange={setPage} />
      </Card>

      <Modal open={importOpen} title="Importer une liste d'étudiants" confirmLabel={`Importer ${parsed.rows.length} étudiant(s)`}
        onConfirm={() => parsed.rows.length && runImport()} onClose={() => !busy && setImportOpen(false)} loading={busy}>
        <p>Une ligne par étudiant : <strong>matricule;nom complet</strong>. Collez la liste ou choisissez un fichier CSV (Excel : « Enregistrer sous » puis CSV).</p>
        <input type="file" accept=".csv,.txt,text/csv,text/plain" onChange={pickFile}
          className="mt-3 block w-full text-[11px] text-slate-600" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7}
          placeholder={'ST-001;Aïcha Koné\nST-002;Lucas Martin'}
          className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-[11px] outline-none focus:border-primary" />
        <p className="mt-2 text-[11px] text-slate-500">
          {parsed.rows.length} ligne(s) valide(s){parsed.invalid > 0 && `, ${parsed.invalid} ignorée(s) (matricule ou nom manquant)`}.
          Un matricule déjà inscrit n'est pas modifié.
        </p>
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