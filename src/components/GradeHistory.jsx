import { useEffect, useState } from 'react'
import { Card } from './ui'
import api, { errorMessage } from '../api'

const fmt = (v) => {
  if (!v) return '—'
  if (v.absent) return 'Absent'
  return v.score === null || v.score === undefined ? 'Non saisie' : String(v.score).replace('.', ',')
}
const when = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })

export default function GradeHistory({ examId }) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    let alive = true
    api.get(`/exams/${examId}/history`)
      .then((r) => alive && setRows(r.data))
      .catch((err) => alive && setError(errorMessage(err)))
    return () => { alive = false }
  }, [open, examId])

  return (
    <Card className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Historique des modifications</h2>
          <p className="text-[11px] text-slate-400">Visible par vous uniquement. Les 200 dernières modifications.</p>
        </div>
        <button onClick={() => setOpen(!open)} className="text-xs font-medium text-primary hover:underline">
          {open ? 'Masquer' : 'Afficher'}
        </button>
      </div>
      {open && (
        <div className="mt-3 overflow-x-auto">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          {rows === null && !error && <p className="py-6 text-center text-xs text-slate-400">Chargement…</p>}
          {rows && rows.length === 0 && <p className="py-6 text-center text-xs text-slate-400">Aucune modification enregistrée pour le moment.</p>}
          {rows && rows.length > 0 && (
            <table className="w-full min-w-[560px] text-xs">
              <thead className="border-b border-slate-100 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Étudiant</th>
                  <th className="px-3 py-2 font-medium">Avant</th>
                  <th className="px-3 py-2 font-medium">Après</th>
                  <th className="px-3 py-2 font-medium">Appréciation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2 text-slate-500">{when(l.at)}</td>
                    <td className="px-3 py-2 text-slate-800">{l.student ? `${l.student.fullName} (${l.student.matricule})` : 'Étudiant supprimé'}</td>
                    <td className="px-3 py-2 text-slate-500">{fmt(l.before)}</td>
                    <td className="px-3 py-2 font-medium text-slate-800">{fmt(l.after)}</td>
                    <td className="px-3 py-2 text-slate-500">
                      {(l.before?.comment ?? '') !== (l.after?.comment ?? '') ? 'modifiée' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Card>
  )
}
