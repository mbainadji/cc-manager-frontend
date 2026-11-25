import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useToast } from '../components/ToastContext'
import api, { errorMessage } from '../api'

const input =
  'mt-1 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm'
const label = 'text-xs font-medium text-slate-600'

export default function StudentRegister() {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', matricule: '', group: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [recovery, setRecovery] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')
    if (form.password !== form.confirm) return setError('Les deux mots de passe ne sont pas identiques.')
    setBusy(true)
    try {
      const { data } = await api.post('/auth/student/register', {
        fullName: form.fullName.trim(),
        matricule: form.matricule.trim(),
        group: form.group.trim(),
        password: form.password,
      })
      toast('success', 'Compte créé.')
      setRecovery(data.recoveryCode)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (recovery) {
    return (
      <div className="flex min-h-dvh items-start justify-center bg-slate-50 px-3 py-6 sm:items-center sm:px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-sm motion-safe:animate-pop sm:p-6">
          <h1 className="text-lg font-semibold text-slate-800">Compte créé</h1>
          <p className="mt-2 text-xs text-slate-500">
            Voici votre code de récupération. Il vous servira à choisir un nouveau mot de passe si vous l'oubliez.
            Notez-le maintenant : il ne sera plus affiché, et votre enseignant ne le connaît pas.
          </p>
          <p className="mt-4 select-all break-all rounded-md bg-slate-50 py-4 text-center font-mono text-xl font-semibold tracking-wider text-slate-800">{recovery}</p>
          <button onClick={() => navigate('/')}
            className="mt-5 min-h-11 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            J'ai noté mon code, me connecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh items-start justify-center bg-slate-50 px-3 py-4 sm:items-center sm:px-4 sm:py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-sm motion-safe:animate-fade-up sm:p-6">
        <h1 className="text-lg font-semibold text-slate-800">Activer mon compte étudiant</h1>
        <p className="mt-1 text-xs text-slate-500">
          Utilisez le nom, le matricule et le groupe figurant sur la liste de votre professeur.
        </p>

        <div className="stagger mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="reg-name" className={label}>Nom complet</label>
            <input id="reg-name" className={input} value={form.fullName} onChange={set('fullName')} required autoComplete="name" />
          </div>
          <div>
            <label htmlFor="reg-matricule" className={label}>Matricule</label>
            <input id="reg-matricule" className={input} value={form.matricule} onChange={set('matricule')} required autoCapitalize="characters" />
          </div>
          <div>
            <label htmlFor="reg-group" className={label}>Groupe</label>
            <input id="reg-group" className={input} value={form.group} onChange={set('group')} required />
          </div>
          <div>
            <label htmlFor="reg-password" className={label}>Mot de passe</label>
            <input id="reg-password" type="password" className={input} value={form.password} onChange={set('password')} required autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="reg-confirm" className={label}>Confirmer le mot de passe</label>
            <input id="reg-confirm" type="password" className={input} value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
          </div>
        </div>

        {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 motion-safe:animate-pop">{error}</p>}

        <button type="submit" disabled={busy}
          className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy && <Loader2 size={14} className="animate-spin" />} Créer mon compte
        </button>

        <Link to="/" className="mt-3 flex min-h-11 items-center justify-center text-xs font-medium text-primary hover:underline">
          J'ai déjà un compte
        </Link>
      </form>
    </div>
  )
}
