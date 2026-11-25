import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileText, Users, Search, Info } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'
import api, { errorMessage } from '../api'

const input = 'mt-1 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100 disabled:text-slate-400 sm:min-h-0 sm:py-2'
const label = 'text-[11px] font-medium text-slate-700'
const check = 'h-5 w-5 shrink-0 accent-primary sm:h-4 sm:w-4'

export default function CreateExam() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const [students, setStudents] = useState(null) // null = chargement
  const [everyone, setEveryone] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ title: '', subject: '', date: '', max: 20, coef: 1, description: '' })
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(editing)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    const calls = [api.get('/students')]
    if (editing) calls.push(api.get(`/exams/${id}`))
    Promise.all(calls)
      .then(([s, e]) => {
        if (!alive) return
        setStudents(s.data)
        if (e) {
          const x = e.data
          setForm({
            title: x.title, subject: x.subject, max: x.maxScore, coef: x.coefficient ?? 1, description: x.description || '',
            date: new Date(x.date).toISOString().slice(0, 10),
          })
          setEveryone(x.allStudents)
          setSelected(new Set((x.studentIds || []).map(String)))
          setPublished(x.status === 'published')
        }
        setLoading(false)
      })
      .catch((err) => {
        if (!alive) return
        setStudents([])
        setLoading(false)
        setError(err.response?.status === 404 ? 'Examen introuvable.' : errorMessage(err))
      })
    return () => { alive = false }
  }, [id, editing])

  const visible = (students ?? []).filter((s) => `${s.matricule} ${s.fullName}`.toLowerCase().includes(q.toLowerCase()))
  const allChecked = visible.length > 0 && visible.every((s) => selected.has(s.id))
  const toggle = (sid) => setSelected((prev) => { const n = new Set(prev); n.has(sid) ? n.delete(sid) : n.add(sid); return n })
  const toggleAll = () => setSelected((prev) => { const n = new Set(prev); visible.forEach((s) => (allChecked ? n.delete(s.id) : n.add(s.id))); return n })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const count = everyone ? (students?.length ?? 0) : selected.size

  const submit = async () => {
    setError('')
    if (!form.title.trim() || !form.subject.trim() || !form.date) return setError('Le titre, la matière et la date sont requis.')
    if (!(Number(form.max) >= 1)) return setError('Le barème doit être supérieur ou égal à 1.')
    if (!(Number(form.coef) > 0)) return setError('Le coefficient doit être supérieur à 0.')
    if (!everyone && selected.size === 0) return setError('Sélectionnez au moins un étudiant.')

    const body = {
      title: form.title,
      subject: form.subject,
      date: form.date,
      description: form.description,
      ...(published ? {} : {
        maxScore: Number(form.max),
        coefficient: Number(form.coef),
        allStudents: everyone,
        students: everyone ? [] : [...selected],
      }),
    }

    setSaving(true)
    try {
      if (editing) await api.patch(`/exams/${id}`, body)
      else await api.post('/exams', body)
      navigate('/examens', { state: { flash: editing ? 'Examen modifié.' : 'Examen créé avec succès.' } })
    } catch (err) {
      setError(errorMessage(err))
      setSaving(false)
    }
  }

  if (loading) return <p className="py-10 text-center text-xs text-slate-400">Chargement…</p>
  if (editing && error && !form.title) return <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>

  return (
    <>
      <PageHeader
        crumbs={`Espace professeur / Examens / ${editing ? 'Modifier' : 'Créer'} un examen`}
        title={editing ? 'Modifier un examen' : 'Créer un examen'}
        subtitle="Renseignez votre évaluation et choisissez les étudiants concernés."
      />

      <div className="stagger grid gap-4 sm:gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FileText size={14} className="text-primary" /> Informations générales</h2>
          <p className="text-[11px] text-slate-400">Définissez le titre, la date et le barème.</p>

          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="exam-title" className={label}>Titre de l'examen *</label>
              <input id="exam-title" className={input} placeholder="CC2" value={form.title} onChange={set('title')} />
              <p className="mt-1 text-[10px] text-slate-400">Exemples : CC1, CC2, TP noté, Interrogation.</p>
            </div>
            <div>
              <label htmlFor="exam-subject" className={label}>Matière ou intitulé de l'évaluation *</label>
              <input id="exam-subject" className={input} placeholder="Analyse mathématique" value={form.subject} onChange={set('subject')} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="exam-date" className={label}>Date de l'examen *</label>
                <input id="exam-date" type="date" className={input} value={form.date} onChange={set('date')} />
              </div>
              <div>
                <label htmlFor="exam-max" className={label}>Barème maximal *</label>
                <input id="exam-max" type="number" inputMode="decimal" min="1" className={input} value={form.max} onChange={set('max')} disabled={published} />
              </div>
              <div>
                <label htmlFor="exam-coef" className={label}>Coefficient</label>
                <input id="exam-coef" type="number" inputMode="decimal" min="0.5" step="0.5" className={input} value={form.coef} onChange={set('coef')} disabled={published} />
              </div>
            </div>
            <div>
              <label htmlFor="exam-desc" className={label}>Description (facultatif)</label>
              <textarea id="exam-desc" rows={3} className={input} placeholder="Consignes sur les sujets et les durées…" value={form.description} onChange={set('description')} />
            </div>
            <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-[11px] text-slate-600">
              <Info size={13} className="mt-0.5 shrink-0 text-primary" />
              <p>
                {published
                  ? 'Examen publié : seuls le titre, la matière, la date et la description peuvent être modifiés.'
                  : "L'examen restera en brouillon : vous pourrez saisir les notes puis publier les résultats."}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Users size={14} className="text-primary" /> Étudiants concernés</h2>
          <p className="text-[11px] text-slate-400">Les étudiants de la liste importée apparaissent ici, inscrits ou non.</p>

          <label className={`mt-4 flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-medium text-slate-800 ${published ? 'opacity-60' : 'cursor-pointer'}`}>
            <input type="checkbox" className={check} checked={everyone} disabled={published} onChange={(e) => setEveryone(e.target.checked)} />
            <span className="min-w-0">
              Tous les étudiants de la liste ({students?.length ?? 0})
              <span className="block text-[10px] font-normal text-slate-400">Les étudiants qui s'inscrivent plus tard seront inclus automatiquement.</span>
            </span>
          </label>

          {!everyone && (
            <div className="motion-safe:animate-fade-up">
              <div className="relative mt-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input aria-label="Rechercher un étudiant" className={`${input} mt-0 pl-8`} placeholder="Rechercher par matricule ou nom" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>

              <div className="mt-3 max-h-96 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                <label className="flex min-h-11 items-center gap-3 bg-blue-50 px-3 py-2 text-xs font-medium text-slate-800">
                  <input type="checkbox" className={check} checked={allChecked} disabled={published} onChange={toggleAll} /> Tout sélectionner ({visible.length})
                </label>
                {students === null && <p className="px-3 py-6 text-center text-xs text-slate-400">Chargement…</p>}
                {students !== null && visible.length === 0 && <p className="px-3 py-6 text-center text-xs text-slate-400">Aucun étudiant dans la liste pour le moment.</p>}
                {visible.map((s) => (
                  <label key={s.id} className="flex min-h-12 cursor-pointer items-center gap-3 px-3 py-2 hover:bg-slate-50">
                    <input type="checkbox" className={check} checked={selected.has(s.id)} disabled={published} onChange={() => toggle(s.id)} />
                    <span className="min-w-0 text-xs">
                      <span className="block break-words font-medium text-slate-800">{s.fullName}</span>
                      <span className="block text-[10px] text-slate-400">{s.matricule}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 motion-safe:animate-pop">{error}</p>}

      {/* Mobile : la barre se place au-dessus du menu du bas ; ordinateur : collée en bas de l'écran */}
      <div className="sticky bottom-[calc(3.5rem_+_env(safe-area-inset-bottom))] z-20 -mx-3 mt-6 flex flex-col gap-3 border-t border-slate-200 bg-white px-3 py-3 sm:-mx-5 sm:px-5 lg:bottom-0 lg:-mx-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-xs text-slate-600">
          <strong>{count} étudiants concernés</strong> · Barème sur {form.max}
          <span className="block text-[10px] text-slate-400">Vous pourrez modifier la sélection plus tard.</span>
        </p>
        <div className="grid grid-cols-2 gap-2 lg:flex">
          <button disabled={saving} onClick={() => navigate('/examens')} className="min-h-11 rounded-md border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 lg:min-h-0">Annuler</button>
          <button disabled={saving} onClick={submit} className="min-h-11 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60 lg:min-h-0">
            {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : "Créer l'examen"}
          </button>
        </div>
      </div>
    </>
  )
}
