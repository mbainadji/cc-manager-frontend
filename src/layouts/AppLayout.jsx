import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  GraduationCap, LayoutDashboard, FileText, PlusCircle, LogOut, Menu, X,
  ClipboardList, Users, CheckCircle2, Settings, Search, Bell, ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const roles = {
  student: {
    label: 'Espace étudiant',
    menu: [{ to: '/resultats', label: 'Mes résultats', icon: FileText }],
  },
  professor: {
    label: 'Espace professeur',
    menu: [
      { to: '/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard },
      { to: '/examens', label: 'Mes examens', icon: ClipboardList, end: true },
      { to: '/examens/nouveau', label: 'Créer un examen', icon: PlusCircle },
      { to: '/etudiants', label: 'Liste des étudiants', icon: Users },
      { to: '/resultats-publies', label: 'Résultats publiés', icon: CheckCircle2 },
    ],
  },
}

export default function AppLayout({ role }) {
  const [open, setOpen] = useState(false)
  const { user: account, logout } = useAuth()
  const navigate = useNavigate()
  const { label, menu } = roles[role]

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
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[220px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-navy p-4 text-white transition-transform lg:static lg:w-auto lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="rounded bg-white/10 p-1.5"><GraduationCap size={16} /></span> CC Manager
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
        <nav className="flex-1 space-y-1">
          {menu.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-xs ${isActive ? 'bg-primary font-medium text-white' : 'text-white/70 hover:bg-white/5'}`}>
              <Icon size={14} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/10 pt-3 text-xs text-white/70">
          <a href="#" className="flex items-center gap-3 px-3 py-2 hover:text-white"><Settings size={14} /> Profil et paramètres</a>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 hover:text-white">
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-5 py-3">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <div>
            <p className="text-sm font-semibold text-slate-900">{greet}</p>
            <p className="text-[11px] capitalize text-slate-400">{today}</p>
          </div>

          {role === 'professor' && (
            <div className="relative ml-auto hidden w-64 md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input placeholder="Rechercher dans CC Manager" className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary" />
            </div>
          )}

          <div className={`flex items-center gap-3 ${role === 'student' ? 'ml-auto' : ''}`}>
            {role === 'professor' && <button className="rounded-md border border-slate-200 p-1.5 text-slate-500"><Bell size={14} /></button>}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{initials}</span>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-800">{name}</p>
              <p className="text-[10px] text-slate-400">{sub}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8"><Outlet /></main>

        <p className="flex items-center justify-center gap-1.5 pb-5 text-[11px] text-slate-400">
          <ShieldCheck size={12} /> Vos données restent confidentielles et ne sont jamais partagées.
        </p>
      </div>
    </div>
  )
}