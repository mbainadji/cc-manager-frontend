import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  GraduationCap, LayoutDashboard, FileText, PlusCircle, LogOut,
  ClipboardList, Users, CheckCircle2, Settings, Search, Bell, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// short : libellé court pour la barre de navigation du bas (mobile)
const roles = {
  student: {
    label: 'Espace étudiant',
    menu: [{ to: '/resultats', label: 'Mes résultats', short: 'Résultats', icon: FileText }],
  },
  professor: {
    label: 'Espace professeur',
    menu: [
      { to: '/tableau-de-bord', label: 'Tableau de bord', short: 'Accueil', icon: LayoutDashboard },
      { to: '/examens', label: 'Mes examens', short: 'Examens', icon: ClipboardList, end: true },
      { to: '/examens/nouveau', label: 'Créer un examen', short: 'Créer', icon: PlusCircle },
      { to: '/etudiants', label: 'Liste des étudiants', short: 'Étudiants', icon: Users },
      { to: '/resultats-publies', label: 'Résultats publiés', short: 'Publiés', icon: CheckCircle2 },
    ],
  },
}

const profile = { to: '/profil', label: 'Profil et paramètres', short: 'Profil', icon: Settings }

export default function AppLayout({ role: roleProp }) {
  const { user: account, logout } = useAuth()
  const navigate = useNavigate()
  const role = roleProp ?? account?.role
  const { label, menu } = roles[role]
  const tabs = [...menu, profile]

  const name = account?.name ?? ''
  const initials = name.replace(/^Pr\.\s*/, '').split(/[\s._-]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  const sub = role === 'student' ? `Matricule : ${account?.matricule ?? ''}` : 'Professeur'
  const greet = `Bienvenue, ${role === 'student' ? name.split(' ')[0] : name}`
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const handleLogout = () => {
    logout()
    navigate(role === 'professor' ? '/professeur' : '/')
  }

  return (
    <div className="min-h-dvh bg-slate-50 lg:grid lg:grid-cols-[220px_1fr]">
      {/* Menu latéral (ordinateur) */}
      <aside className="hidden flex-col bg-navy p-4 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:overflow-y-auto">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <span className="rounded bg-white/10 p-1.5"><GraduationCap size={16} /></span> CC Manager
        </div>

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
        <nav className="flex-1 space-y-1">
          {menu.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-xs ${isActive ? 'bg-primary font-medium text-white' : 'text-white/70 hover:bg-white/5'}`}>
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 pt-3 text-xs text-white/70">
          <NavLink to="/profil"
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 hover:text-white ${isActive ? 'text-white' : ''}`}>
            <Settings size={14} /> Profil et paramètres
          </NavLink>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 hover:text-white">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{greet}</p>
            <p className="hidden truncate text-[11px] capitalize text-slate-400 sm:block">{today}</p>
          </div>

          {role === 'professor' && (
            <div className="relative hidden w-64 md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Rechercher dans CC Manager" className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary" />
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {role === 'professor' && (
              <button aria-label="Notifications" className="hidden rounded-md border border-slate-200 p-1.5 text-slate-500 sm:block">
                <Bell size={14} />
              </button>
            )}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials}</span>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-800">{name}</p>
              <p className="text-[10px] text-slate-400">{sub}</p>
            </div>
            <button onClick={handleLogout} aria-label="Déconnexion"
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 lg:hidden">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-8"><Outlet /></main>

        <p className="flex items-center justify-center gap-1.5 px-4 pb-[calc(5rem_+_env(safe-area-inset-bottom))] text-center text-[11px] text-slate-400 lg:pb-5">
          <ShieldCheck size={12} className="shrink-0" /> Vos données restent confidentielles et ne sont jamais partagées.
        </p>
      </div>

      {/* Barre de navigation du bas (mobile et tablette), accessible au pouce */}
      <nav aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {tabs.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} aria-label={label}
            className={({ isActive }) => `flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] ${isActive ? 'font-semibold text-primary' : 'text-slate-500'}`}>
            <Icon size={20} />
            <span className="max-w-full truncate">{short}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
