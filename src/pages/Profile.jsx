import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'

const input = 'mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
const label = 'text-[11px] font-medium text-slate-700'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.next.length < 8) return setError('Le nouveau mot de passe doit faire 8 caractères minimum.')
    if (form.next !== form.confirm) return setError('Les deux mots de passe ne correspondent pas.')
    setBusy(true)
    try {
      await api.patch('/auth/password', { currentPassword: form.current, newPassword: form.next })
      setForm({ current: '', next: '', confirm: '' })
      toast('success', 'Mot de passe modifié.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const info = [
    ['Nom', user?.name],
    user?.role === 'student' ? ['Matricule', user?.matricule] : ['E-mail', user?.email],
    ['Rôle', user?.role === 'student' ? 'Étudiant' : 'Professeur'],
  ]

  return (
    <>
      <PageHeader
        crumbs="Profil et paramètres"
        title="Profil et paramètres"
        subtitle="Vos informations et la sécurité de votre compte."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-slate-900">Mes informations</h2>
          <dl className="mt-4 space-y-4">
            {info.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <KeyRound size={14} className="text-primary" /> Changer le mot de passe
          </h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className={label}>Mot de passe actuel</label>
              <input type="password" className={input} value={form.current} onChange={set('current')} autoComplete="current-password" required />
            </div>
            <div>
              <label className={label}>Nouveau mot de passe</label>
              <input type="password" className={input} value={form.next} onChange={set('next')} placeholder="8 caractères minimum" autoComplete="new-password" required />
            </div>
            <div>
              <label className={label}>Confirmer le nouveau mot de passe</label>
              <input type="password" className={input} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required />
            </div>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </form>
        </Card>
      </div>
    </>
  )
}