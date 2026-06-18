/** Footer corporativo de "Dream Legacy" — coherente con la marca MattelUCAB. */
import { IconDna, IconShield, IconReport } from "../ui/icons";
import { BarbieConfetti, BarbieIconRow } from "../ui/Decor";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      {/* Franja de marca con corte diagonal sutil */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-700 via-navy-600 to-grape-600 px-6 py-8 text-white">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rotate-12 bg-brand-500/20" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 -rotate-12 bg-brand-300/10" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
        <BarbieConfetti tone="light" />
        <div className="relative mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-display text-lg">MU</span>
              <div className="leading-tight">
                <p className="font-bold">MattelUCAB</p>
                <p className="text-xs text-white/70">Dream Legacy · PLM</p>
              </div>
            </div>
            <p className="mt-3 max-w-xs text-sm text-white/70">
              Plataforma de gestión del ciclo de vida del producto. Back-Office corporativo
              y Front-Office de e-commerce en un solo lugar.
            </p>
            <BarbieIconRow className="mt-4 text-brand-200/80" />
          </div>

          <FooterCol title="Plataforma" icon={<IconShield className="h-4 w-4" />} items={["Usuarios & Roles", "Privilegios", "Matriz de permisos", "Simulador de sesión"]} />
          <FooterCol title="Genoma Barbie" icon={<IconDna className="h-4 w-4" />} items={["Catálogo ADN", "Reglas de fits", "Multiverso laboral", "Packs"]} />
          <FooterCol title="Inteligencia" icon={<IconReport className="h-4 w-4" />} items={["Rentabilidad por ADN", "Índice de diversidad", "Monitor de scalpers", "Documentos"]} />
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-slate-400 sm:flex-row">
        <p>© {year} MattelUCAB — Ingeniería de Entretenimiento & Propiedad Intelectual.</p>
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-emerald-400" />
          Entorno de demostración · datos simulados
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-brand-200">{icon}{title}</p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it}>
            <span className="cursor-default text-sm text-white/70 transition hover:text-white">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
