import { useSession } from "../../../context/SessionContext";
import { Card, Badge, SectionHeader, Button } from "../../ui/primitives";
import { IconSpark, IconCheck, IconClose, IconLock, IconEye } from "../../ui/icons";

/** Capacidades del sistema mapeadas a permisos, para visualizar el acceso. */
const CAPS = [
  { permiso: "perm-prod-ver", label: "Ver catálogo de productos", modulo: "Productos" },
  { permiso: "perm-prod-edit", label: "Diseñar / editar el genoma", modulo: "Productos" },
  { permiso: "perm-inv-ver", label: "Ver inventario", modulo: "Inventario" },
  { permiso: "perm-inv-edit", label: "Modificar stock", modulo: "Inventario" },
  { permiso: "perm-ventas-ver", label: "Ver precios de lista", modulo: "Ventas" },
  { permiso: "perm-ventas-edit", label: "Registrar ventas / facturar", modulo: "Ventas" },
  { permiso: "perm-costos-ver", label: "Ver costos y márgenes", modulo: "Costos", sensible: true },
  { permiso: "perm-subastas-ver", label: "Acceder a subastas exclusivas", modulo: "Subastas" },
  { permiso: "perm-reportes-ver", label: "Generar reportes", modulo: "Reportes" },
  { permiso: "perm-usuarios-admin", label: "Administrar usuarios y roles", modulo: "Usuarios" },
];

export function SimuladorTab() {
  const { roles, rolActual, setRolActualId, can, isBackOffice, puedeVerSensible } = useSession();
  const back = roles.filter((r) => r.ambito === "BACK_OFFICE");
  const front = roles.filter((r) => r.ambito === "FRONT_OFFICE");
  const concedidos = CAPS.filter((c) => can(c.permiso)).length;

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconSpark className="h-5 w-5" />}
        title="Simulador de sesión por rol"
        subtitle="Inicia sesión como cualquier rol y observa en vivo cómo se filtran menús, columnas sensibles y acciones. El cambio se refleja en todo el sistema."
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Selector de rol */}
        <div className="space-y-4">
          <Card className="p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-navy-500">Back-Office (Internos)</p>
            <div className="space-y-1.5">
              {back.map((r) => <RolPick key={r.id} r={r} active={r.id === rolActual.id} onClick={() => setRolActualId(r.id)} />)}
            </div>
          </Card>
          <Card className="p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-500">Front-Office (Externos)</p>
            <div className="space-y-1.5">
              {front.map((r) => <RolPick key={r.id} r={r} active={r.id === rolActual.id} onClick={() => setRolActualId(r.id)} />)}
            </div>
          </Card>
        </div>

        {/* Vista previa de acceso */}
        <div className="space-y-4">
          <Card className={`relative overflow-hidden p-5 text-white ${isBackOffice ? "bg-gradient-to-br from-navy-700 to-navy-500" : "bg-gradient-to-br from-brand-500 to-grape-600"}`}>
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Sesión activa</p>
            <h3 className="mt-1 text-2xl font-extrabold">{rolActual.nombre}</h3>
            <p className="mt-1 max-w-lg text-sm text-white/80">{rolActual.descripcion}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Stat label="Ámbito" value={isBackOffice ? "Back-Office" : "Front-Office"} />
              <Stat label="Capacidades" value={`${concedidos} / ${CAPS.length}`} />
              <Stat label="Datos sensibles" value={puedeVerSensible ? "Visibles" : "Ocultos"} />
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-navy-700"><IconEye className="h-4 w-4 text-brand-500" />Capacidades del rol</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CAPS.map((c) => {
                const ok = can(c.permiso);
                const blockedSensible = c.sensible && !ok;
                return (
                  <div key={c.permiso} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition ${ok ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${ok ? "bg-emerald-500 text-white" : blockedSensible ? "bg-rose-100 text-rose-500" : "bg-slate-200 text-slate-400"}`}>
                      {ok ? <IconCheck className="h-4 w-4" /> : blockedSensible ? <IconLock className="h-3.5 w-3.5" /> : <IconClose className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className={`truncate text-sm font-medium ${ok ? "text-navy-700" : "text-slate-400"}`}>{c.label}</p>
                      <p className="text-[11px] text-slate-400">{c.modulo}{c.sensible && " · sensible"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {!puedeVerSensible && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <IconLock className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Este rol <b>no</b> puede ver costos ni márgenes de ganancia. Esas columnas se ocultan automáticamente en todo el sistema (hermeticidad por perfil).</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function RolPick({ r, active, onClick }: { r: { nombre: string; descripcion: string; permisosIds: string[] }; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left transition ${active ? "bg-brand-50 ring-1 ring-brand-300" : "hover:bg-slate-50"}`}>
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${active ? "bg-brand-500" : "bg-slate-300"}`} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-navy-700">{r.nombre}</span>
          {active && <Badge tone="brand">activo</Badge>}
        </span>
        <span className="block truncate text-xs text-slate-400">{r.descripcion}</span>
      </span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
      <p className="text-[10px] uppercase tracking-wide text-white/70">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
