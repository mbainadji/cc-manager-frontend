import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Card, PageHeader, Badge, Th } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'

const input = 'mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export default function Professors() {
  const { user } = useAuth()
  const toast = useToast()
  const [list, setList] = useState(null)
  const [form, setForm] = useState({ fullName: '', email: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [temp, setTemp] = useState(null) // { name, password }

  const load = () =>
    api.get('/professors').then((r) => setList(r.data)).catch((err) => { setList([]); setError(errorMessage(err)) })

  useEffect(() => { if (user?.isAdmin) load() }, [user?.isAdmin])

  if (!user?.isAdmin)
    return <p className="rounded-md bg-slate-50 px-3 py-3 text-xs text-slate-600">
      Page réservée à l'administrateur. Si vous venez d'être promu, déconnectez-vous puis reconnectez-vous.
    </p>

  const create = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/professors', form)
      setTemp({ name: data.name, password: data.password })
      setForm({ fullName: '', email: '' })
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const reset = async (p) => {
    if (!window.confirm(`Générer un nouveau mot de passe provisoire pour ${p.name} ? L'ancien ne fonctionnera plus.`)) return
    try {
      const { data } = await api.post(`/professors/${p.id}/reset-password`)
      setTemp({ name: p.name, password: data.password })
    } catch (err) {
      toast('error', errorMessage(err))
    }
  }

  return (
    <>
      <PageHeader crumbs="Espace professeur / Administration" title="Comptes professeur"
        subtitle="Créez des comptes et remettez le mot de passe provisoire en main propre. Chaque professeur le change ensuite dans « Profil et paramètres »." />

      {temp && (
        <div className="mb-4 rounded-md bg-blue-50 px-4 py-3 text-xs text-slate-700">
          Mot de passe provisoire de <strong>{temp.name}</strong> : <strong className="select-all font-mono">{temp.password}</strong>.
          Notez-le maintenant, il ne sera plus affiché.
          <button onClick={() => setTemp(null)} className="ml-3 font-medium text-primary hover:underline">Fermer</button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><UserPlus size={14} className="text-primary" /> Nouveau professeur</h2>
          <form onSubmit={create} className="mt-4 space-y-4">
            <div>
              <label className="text-[11px] font-medium text-slate-700">Nom complet</label>
              <input className={input} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-700">Adresse e-mail</label>
              <input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {busy ? 'Création…' : 'Créer le compte'}
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900">Professeurs</h2>
          <table className="mt-3 w-full text-xs">
            <thead className="border-b border-slate-100"><tr><Th>Nom</Th><Th>E-mail</Th><Th>Action</Th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(list ?? []).map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{p.name} {p.isAdmin && <Badge tone="blue">Admin</Badge>}</td>
                  <td className="px-3 py-2.5 text-slate-500">{p.email}</td>
                  <td className="px-3 py-2.5">
                    {p.id !== user.id && (
                      <button onClick={() => reset(p)} className="font-medium text-primary hover:underline">Réinitialiser le mot de passe</button>
                    )}
                  </td>
                </tr>
              ))}
              {list === null && <tr><td colSpan={3} className="px-3 py-8 text-center text-slate-400">Chargement…</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  )
}
