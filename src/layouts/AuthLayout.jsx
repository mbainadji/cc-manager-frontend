import { GraduationCap, Lock, ShieldCheck, Users, BookOpen, LifeBuoy } from 'lucide-react'

const icons = { users: Users, book: BookOpen, shield: ShieldCheck, lock: Lock }

export default function AuthLayout({ eyebrow, title, subtitle, features = [], children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      {/* Barre mobile */}
      <header className="flex items-center justify-between bg-navy px-5 py-4 text-white lg:hidden">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="rounded bg-white/10 p-1"><GraduationCap size={16} /></span> CC Manager
        </div>
        <LifeBuoy size={16} className="text-white/70" />
      </header>

      {/* Panneau gauche (ordinateur) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="rounded bg-white/10 p-1.5"><GraduationCap size={16} /></span> CC Manager
        </div>

        <div className="relative z-10 max-w-md">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-white/50">{eyebrow}</p>
          <h1 className="text-4xl font-bold leading-tight">{title}</h1>
          <p className="mt-4 text-sm text-white/60">{subtitle}</p>

          <ul className="mt-8 space-y-4">
            {features.map(({ icon, title, text }) => {
              const Icon = icons[icon]
              return (
                <li key={title} className="flex items-start gap-3">
                  <span className="rounded-md bg-white/10 p-2"><Icon size={14} /></span>
                  <div>
                    <p className="text-xs font-semibold">{title}</p>
                    <p className="text-[11px] text-white/50">{text}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="relative z-10 text-[10px] uppercase tracking-widest text-white/40">
          Un espace sécurisé pour votre contrôle continu
        </p>

        {/* Bâtiment décoratif */}
        <svg viewBox="0 0 400 200" className="pointer-events-none absolute bottom-0 left-0 w-full text-white/5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M60 190h280M80 190v-70M140 190v-70M200 190v-70M260 190v-70M320 190v-70M50 120h300L200 40 50 120z" />
        </svg>
      </aside>

      {/* Contenu */}
      <main className="flex flex-col bg-slate-50">
        <div className="hidden justify-end px-8 pt-6 lg:flex">
          <a href="#" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
            <LifeBuoy size={14} /> Besoin d'aide ?
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="flex items-center justify-center gap-4 px-5 pb-6 text-[11px] text-slate-400">
          <a href="#">Aide</a><a href="#">Confidentialité</a><a href="#">Conditions</a>
          <span>© 2026 CC Manager</span>
        </footer>
      </main>
    </div>
  )
}