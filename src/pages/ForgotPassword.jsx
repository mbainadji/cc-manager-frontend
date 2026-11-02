import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import api, { errorMessage } from '../api'

const input =
  'w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ matricule: '', recoveryCode: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [newCode, setNewCode] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')
    if (form.password !== form.confirm) return setError('Les deux mots de passe ne sont pas identiques.')
    setBusy(true)
    try {
      const { data } = await api.post('/auth/student/reset', {
        matricule: form.matricule.trim(),
        recoveryCode: form.recoveryCode.trim(),
        password: form.password,
      })
      setNewCode(data.recoveryCode)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (newCode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">Mot de passe modifié</h1>
          <p className="mt-2 text-xs text-slate-500">
            Votre ancien code de récupération ne fonctionne plus. Voici le nouveau : notez-le maintenant, il ne sera plus affiché.
          </p>
          <p className="mt-4 select-all rounded-md bg-slate-50 py-3 text-center font-mono text-xl font-semibold tracking-wider text-slate-800">{newCode}</p>
          <button onClick={() => navigate('/')}
            className="mt-5 w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            J'ai noté mon code, me connecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Mot de passe oublié</h1>
        <p className="mt-1 text-xs text-slate-500">
          Utilisez le code de récupération affiché à la création de votre compte. Votre enseignant ne peut pas réinitialiser votre mot de passe.
        </p>

        <label className="mt-5 block text-xs font-medium text-slate-600">Matricule</label>
        <input className={`${input} mt-1`} value={form.matricule} onChange={set('matricule')} required />

        <label className="mt-4 block text-xs font-medium text-slate-600">Code de récupération</label>
        <input className={`${input} mt-1 font-mono uppercase`} value={form.recoveryCode} onChange={set('recoveryCode')} required placeholder="XXXX-XXXX" autoComplete="off" />

        <label className="mt-4 block text-xs font-medium text-slate-600">Nouveau mot de passe</label>
        <input type="password" className={`${input} mt-1`} value={form.password} onChange={set('password')} required autoComplete="new-password" />

        <label className="mt-4 block text-xs font-medium text-slate-600">Confirmer le mot de passe</label>
        <input type="password" className={`${input} mt-1`} value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

        <button type="submit" disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy && <Loader2 size={14} className="animate-spin" />} Changer mon mot de passe
        </button>

        <Link to="/" className="mt-4 block text-center text-xs font-medium text-primary hover:underline">Retour à la connexion</Link>
      </form>
    </div>
  )
}
