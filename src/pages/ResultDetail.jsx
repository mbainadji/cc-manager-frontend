import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { Card, PageHeader, Badge, Notice } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import api, { errorMessage } from '../api'
import { fmtDate } from '../format'

export default function ResultDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [r, setR] = useState(null) // null = chargement
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    api.get(`/results/${id}`)
      .then((res) => alive && setR(res.data))
      .catch((err) => alive && setError(err.response?.status === 404 ? 'Résultat introuvable.' : errorMessage(err)))
    return () => { alive = false }
  }, [id])

  if (error) return <p className="text-sm text-slate-500">{error}</p>
  if (!r) return <p className="py-10 text-center text-xs text-slate-400">Chargement…</p>

  const info = [
    ['Matière', r.subject],
    ['Date d’évaluation', fmtDate(r.date)],
    ['Date de publication', fmtDate(r.publishedAt)],
    ['Professeur', r.teacher],
  ]

  return (
    <>
      <PageHeader
        crumbs={`Mes résultats / ${r.title} / Détail`}
        title="Détail du résultat"
        subtitle="Le détail de votre évaluation et ce qui vous est personnellement destiné."
        actions={
          <Link to="/resultats" className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <ArrowLeft size={14} /> Retour à mes résultats
          </Link>
        }
      />

      <Card>
        <Badge tone="green">Publié</Badge>
        <h2 className="mt-3 text-xl font-bold text-slate-900">{r.title}</h2>
        <p className="text-xs text-slate-400">{user?.name} · Matricule {user?.matricule}</p>

        <div className="mt-5 grid gap-6 md:grid-cols-[200px_1fr]">
          <div className="rounded-lg bg-blue-50 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Note obtenue</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{r.score} / {r.max}</p>
            <p className="mt-1 text-[11px] text-slate-500">Barème : {r.max} points</p>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2">
            {info.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <MessageSquare size={14} className="text-primary" /> Appréciation du professeur
          </p>
          <p className="mt-2 text-xs text-slate-600">{r.comment || 'Aucune appréciation pour cette évaluation.'}</p>
          <p className="mt-2 text-[10px] text-slate-400">Publié le {fmtDate(r.publishedAt)}</p>
        </div>
      </Card>

      <div className="mt-4">
        <Notice>Cette fiche est personnelle et accessible uniquement depuis votre espace étudiant.</Notice>
      </div>
    </>
  )
}