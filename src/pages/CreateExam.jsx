import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Users, Search, Info } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'
import api, { errorMessage } from '../api'

const input = 'mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
const label = 'text-[11px] font-medium text-slate-700'

export default function CreateExam() {
  const navigate = useNavigate()
  const [students, setStudents] = useState(null) // null = chargement
  const [everyone, setEveryone] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ title: '', subject: '', date: '', max: 20, description: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    api.get('/students')
      .then((res) => alive && setStudents(res.data))
      .catch((err) => { if (alive) { setStudents([]); setError(errorMessage(err)) } })
    return () => { alive = false }
  }, [])

  const visible = (students ?? []).filter((s) => `${s.matricule} ${s.fullName}`.toLowerCase().includes(q.toLowerCase()))
  const allChecked = visible.length > 0 && visible.every((s) => selected.has(s.id))
  const toggle = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleAll = () => setSelected((prev) => { const n = new Set(prev); visible.forEach((s) => (allChecked ? n.delete(s.id) : n.add(s.id))); return n })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const count = everyone ? (students?.length ?? 0) : selected.size

  const submit = async () => {
    setError('')
    if (!form.title.trim() || !form.subject.trim() || !form.date) return setError('Le titre, la matière et la date sont requis.')
    if (!(Number(form.max) >= 1)) return setError('Le barème doit être supérieur ou égal à 1.')
    if (!everyone && selected.size === 0) return setError('Sélectionnez au moins un étudiant.')

    setSaving(true)
    try {
      await api.post('/exams', {
        title: form.title,
        subject: form.subject,
        date: form.date,
        maxScore: Number(form.max),
        description: form.description,
        allStudents: everyone,
        students: everyone ? [] : [...selected],
      })
      navigate('/examens', { state: { flash: 'Examen créé avec succès.' } })
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        crumbs="Espace professeur / Examens / Créer un examen"
        title="Créer un examen"
        subtitle="Renseignez votre évaluation et choisissez les étudiants concernés."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FileText size={14} className="text-primary" /> Informations générales</h2>
          <p className="text-[11px] text-slate-400">Définissez le titre, la date et le barème.</p>

          <div className="mt-4 space-y-4">
            <div>
              <label className={label}>Titre de l'examen *</label>
              <input className={input} placeholder="CC2" value={form.title} onChange={set('title')} />
              <p className="mt-1 text-[10px] text-slate-400">Exemples : CC1, CC2, TP noté, Interrogation.</p>
            </div>
            <div>
              <label className={label}>Matière ou intitulé de l'évaluation *</label>
              <input className={input} placeholder="Analyse mathématique" value={form.subject} onChange={set('subject')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Date de l'examen *</label><input type="date" className={input} value={form.date} onChange={set('date')} /></div>
              <div><label className={label}>Barème maximal *</label><input type="number" min="1" className={input} value={form.max} onChange={set('max')} /></div>
            </div>
            <div>
              <label className={label}>Description (facultatif)</label>
              <textarea rows={3} className={input} placeholder="Consignes sur les sujets et les durées…" value={form.description} onChange={set('description')} />
            </div>
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-[11px] text-slate-600">
              <Info size={13} className="mt-0.5 shrink-0 text-primary" />
              <p>L'examen restera en brouillon : vous pourrez saisir les notes puis publier les résultats.</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users size={14} className="text-primary" /> Étudiants concernés</h2>
          <p className="text-[11px] text-slate-400">Les étudiants apparaissent ici dès leur inscription sur la plateforme.</p>

          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-800">
            <input type="checkbox" checked={everyone} onChange={(e) => setEveryone(e.target.checked)} />
            <span>
              Tous les étudiants inscrits ({students?.length ?? 0})
              <span className="block text-[10px] font-normal text-slate-400">Les étudiants qui s'inscrivent plus tard seront inclus automatiquement.</span>
            </span>
          </label>

          {!everyone && (
            <>
              <div className="relative mt-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${input} mt-0 pl-8`} placeholder="Rechercher par matricule ou nom" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>

              <div className="mt-3 max-h-96 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                <label className="flex items-center gap-3 bg-blue-50 px-3 py-2 text-xs font-medium text-slate-800">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} /> Tout sélectionner ({visible.length})
                </label>
                {students === null && <p className="px-3 py-6 text-center text-xs text-slate-400">Chargement…</p>}
                {students !== null && visible.length === 0 && <p className="px-3 py-6 text-center text-xs text-slate-400">Aucun étudiant inscrit pour le moment.</p>}
                {visible.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50">
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                    <span className="text-xs">
                      <span className="font-medium text-slate-800">{s.fullName}</span>
                      <span className="block text-[10px] text-slate-400">{s.matricule}</span>
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <div className="sticky bottom-0 -mx-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3 lg:-mx-8 lg:px-8">
        <p className="text-xs text-slate-600">
          <strong>{count} étudiants concernés</strong> · Barème sur {form.max}
          <span className="block text-[10px] text-slate-400">Vous pourrez modifier la sélection plus tard.</span>
        </p>
        <button disabled={saving} onClick={submit} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? 'Création…' : "Créer l'examen"}
        </button>
      </div>
    </>
  )
}