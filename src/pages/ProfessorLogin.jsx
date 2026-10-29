import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'
import api, { errorMessage } from '../api'

export default function ProfessorLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      const { data: res } = await api.post('/auth/professor/login', {
        email: data.email,
        password: data.password,
      })
      login({ ...res.user, token: res.token })
      navigate('/tableau-de-bord')
    } catch (err) {
      setError('root.server', { message: errorMessage(err) })
    }
  }

  return (
    <AuthLayout
      eyebrow="Espace professeur"
      title="Vos évaluations, sous contrôle."
      subtitle="Créez vos examens, saisissez les notes et publiez les résultats en toute sécurité."
      features={[
        { icon: 'book', title: 'Examens illimités', text: 'Créez autant d’évaluations que nécessaire.' },
        { icon: 'shield', title: 'Accès sécurisé', text: 'Réservé aux professeurs autorisés.' },
      ]}
    >
      <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Accès professeur</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Connexion professeur</h2>
        <p className="mt-2 text-xs text-slate-500">
          Les comptes professeur sont créés par l'administration de l'établissement.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Field label="Adresse e-mail" name="email" type="email" register={register}
            placeholder="prenom.nom@etablissement.fr"
            rules={{ required: "L'e-mail est requis" }} error={errors.email?.message} />
          <Field label="Mot de passe" name="password" type="password" register={register}
            placeholder="Saisissez votre mot de passe"
            rules={{ required: 'Le mot de passe est requis' }} error={errors.password?.message} />

          {errors.root?.server && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
              {errors.root.server.message}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting
              ? <><Loader2 size={14} className="animate-spin" /> Connexion…</>
              : <>Se connecter <ArrowRight size={14} /></>}
          </button>
        </form>

        <Link to="/" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline">
          <ArrowLeft size={12} /> Retour à la connexion étudiant
        </Link>
      </div>
    </AuthLayout>
  )
}