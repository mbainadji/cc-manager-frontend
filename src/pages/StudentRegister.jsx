import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import api, { errorMessage } from '../api'

export default function StudentRegister() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const { data: res } = await api.post('/auth/student/register', {
        fullName: data.fullName,
        matricule: data.matricule,
        password: data.password,
      })
      login({ ...res.user, token: res.token })
      navigate('/resultats')
    } catch (err) {
      setError('root.server', { message: errorMessage(err) })
    }
  }

  return (
    <AuthLayout
      eyebrow="Espace étudiant"
      title="Rejoignez CC Manager."
      subtitle="Activez votre compte pour consulter vos notes de contrôle continu en toute confidentialité."
      features={[
        { icon: 'book', title: 'Vos résultats', text: 'Retrouvez vos notes publiées au même endroit.' },
        { icon: 'shield', title: 'Confidentialité', text: 'Vous seul voyez vos notes.' },
      ]}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Activation</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Activer mon compte étudiant</h2>
        <p className="mt-2 text-xs text-slate-500">
          Saisissez votre nom et votre matricule tels que fournis par votre établissement, puis choisissez un mot de passe.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Field
            label="Nom complet" name="fullName" register={register}
            placeholder="Saisissez votre nom complet"
            rules={{ required: 'Le nom complet est requis' }}
            error={errors.fullName?.message}
          />
          <Field
            label="Matricule" name="matricule" register={register}
            placeholder="Saisissez votre matricule"
            rules={{ required: 'Le matricule est requis' }}
            error={errors.matricule?.message}
          />
          <Field
            label="Mot de passe" name="password" type="password" register={register}
            placeholder="8 caractères minimum"
            rules={{
              required: 'Le mot de passe est requis',
              minLength: { value: 8, message: '8 caractères minimum' },
            }}
            error={errors.password?.message}
          />
          <Field
            label="Confirmer le mot de passe" name="confirm" type="password" register={register}
            placeholder="Saisissez-le à nouveau"
            rules={{
              required: 'Veuillez confirmer le mot de passe',
              validate: (v) => v === watch('password') || 'Les mots de passe ne correspondent pas',
            }}
            error={errors.confirm?.message}
          />

          {errors.root?.server && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {errors.root.server.message}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting
              ? <><Loader2 size={14} className="animate-spin" /> Activation…</>
              : <>Activer mon compte <ArrowRight size={14} /></>}
          </button>
        </form>

        <Link to="/" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <ArrowLeft size={12} /> Retour à la connexion
        </Link>
      </div>
    </AuthLayout>
  )
}