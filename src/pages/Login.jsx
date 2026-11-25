import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import api, { errorMessage } from '../api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const { data: res } = await api.post('/auth/student/login', {
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
      eyebrow="Espace notes & résultats"
      title="Le contrôle continu, en toute clarté."
      subtitle="Un espace pensé pour les institutions, de la saisie des notes à la consultation des résultats."
      features={[
        { icon: 'users', title: 'Professeurs', text: 'Créez, notez et publiez vos évaluations.' },
        { icon: 'book', title: 'Étudiants', text: 'Consultez vos notes en toute confidentialité.' },
      ]}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Connexion</p>
        <h2 className="mt-2 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
          Gérez vos examens en toute simplicité
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Retrouvez vos évaluations et vos notes dans votre espace personnel.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="stagger mt-5 space-y-4 sm:mt-6" noValidate>
          <Field
            label="Nom complet" name="fullName" register={register} autoComplete="name"
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
            label="Mot de passe" name="password" type="password" register={register} autoComplete="current-password"
            placeholder="Saisissez votre mot de passe"
            rules={{ required: 'Le mot de passe est requis' }}
            error={errors.password?.message}
          />

          {errors.root?.server && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {errors.root.server.message}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting
              ? <><Loader2 size={14} className="animate-spin" /> Connexion…</>
              : <>Se connecter <ArrowRight size={14} /></>}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> Nouveau sur CC Manager ? <span className="h-px flex-1 bg-slate-200" />
        </div>

        <Link to="/mot-de-passe-oublie" className="mb-2 flex min-h-11 items-center justify-center text-xs font-medium text-primary hover:underline">
          Mot de passe oublié ?
        </Link>
        <Link to="/inscription" className="flex min-h-11 w-full items-center justify-center rounded-md border border-slate-200 py-2.5 text-sm font-medium text-primary hover:bg-slate-50">
          Activer mon compte étudiant
        </Link>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Vos données sont chiffrées et ne sont jamais partagées.
        </p>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <ShieldCheck size={14} /> Accès professeur
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Espace dédié à la saisie et à la publication des notes.</p>
          <Link to="/professeur" className="mt-3 flex min-h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white py-2 text-center text-xs font-medium text-primary hover:bg-slate-100">
            Se connecter en tant que professeur
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
