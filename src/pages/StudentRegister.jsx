import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'

const input =
  'w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export default function StudentRegister() {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', matricule: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')
    if (form.password !== form.confirm) return setError('Les deux mots de passe ne sont pas identiques.')
    setBusy(true)
    try {
      await api.post('/auth/student/register', {
        fullName: form.fullName.trim(),
        matricule: form.matricule.trim(),
        password: form.password,
      })
      toast('success', 'Compte créé. Vous pouvez vous connecter.')
      navigate('/')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Activer mon compte étudiant</h1>
        <p className="mt-1 text-xs text-slate-500">
          Utilisez le nom et le matricule figurant sur la liste de votre professeur.
        </p>

        <label className="mt-5 block text-xs font-medium text-slate-600">Nom complet</label>
        <input className={`${input} mt-1`} value={form.fullName} onChange={set('fullName')} required autoComplete="name" />

        <label className="mt-4 block text-xs font-medium text-slate-600">Matricule</label>
        <input className={`${input} mt-1`} value={form.matricule} onChange={set('matricule')} required />

        <label className="mt-4 block text-xs font-medium text-slate-600">Mot de passe</label>
        <input type="password" className={`${input} mt-1`} value={form.password} onChange={set('password')} required autoComplete="new-password" />

        <label className="mt-4 block text-xs font-medium text-slate-600">Confirmer le mot de passe</label>
        <input type="password" className={`${input} mt-1`} value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <button type="submit" disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy && <Loader2 size={14} className="animate-spin" />} Créer mon compte
        </button>

        <Link to="/" className="mt-4 block text-center text-xs font-medium text-primary hover:underline">
          J'ai déjà un compte
        </Link>
      </form>
    </div>
  )
}
