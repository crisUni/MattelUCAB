import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { Sidebar, type NavItem } from "../components/layout/Sidebar";
import { Card, EmptyState } from "../components/ui/primitives";
import { IconUsers, IconDna, IconReport, IconHome, IconLock, IconMenu, IconBox } from "../components/ui/icons";
import { UsuariosModule } from "../components/modules/usuarios/UsuariosModule";
import { ProductosModule } from "../components/modules/productos/ProductosModule";
import { InventarioModule } from "../components/modules/inventario/InventarioModule";
import { ReportesModule } from "../components/modules/reportes/ReportesModule";
import { InicioView } from "./InicioView";

interface ModuleDef extends NavItem {
  /** Recurso cuyo permiso VER se requiere para ver el módulo (undefined = siempre visible). */
  recurso?: string;
  render: () => React.ReactNode;
  titulo: string;
  subtitulo: string;
}

const MODULES: ModuleDef[] = [
  { id: "inicio", label: "Inicio", icon: <IconHome className="h-5 w-5" />, scope: "AMBOS", render: () => <InicioView />, titulo: "Panel principal", subtitulo: "Resumen del sistema Dream Legacy" },
  { id: "usuarios", label: "Usuarios & Seguridad", icon: <IconUsers className="h-5 w-5" />, scope: "BACK_OFFICE", recurso: "USUARIO", render: () => <UsuariosModule />, titulo: "Gestión de Usuarios, Roles y Privilegios", subtitulo: "Hermeticidad de la información según el perfil" },
  { id: "productos", label: "Genoma Barbie", icon: <IconDna className="h-5 w-5" />, scope: "AMBOS", recurso: "PRODUCTO", render: () => <ProductosModule />, titulo: "Catálogo y Diseño de Productos", subtitulo: "El ADN de cada muñeca y sus reglas de compatibilidad" },
  { id: "inventario", label: "Inventario", icon: <IconBox className="h-5 w-5" />, scope: "AMBOS", recurso: "INVENTARIO", render: () => <InventarioModule />, titulo: "Inventario por Hub Regional", subtitulo: "Stock de cada producto distribuido por almacén y hub" },
  { id: "reportes", label: "Reportes", icon: <IconReport className="h-5 w-5" />, scope: "AMBOS", recurso: "REPORTE", render: () => <ReportesModule />, titulo: "Reportes", subtitulo: "Visores tipo JasperReports" },
];

export function Dashboard() {
  const { puede, sesion, autenticado, cerrarSesion } = useSession();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("inicio");

  const visibles = useMemo(
    () => MODULES.filter((m) => !m.recurso || puede(m.recurso, "VER")),
    [puede]
  );

  // Si al cambiar de rol el módulo activo deja de ser visible, vuelve a Inicio.
  useEffect(() => {
    if (!visibles.some((m) => m.id === active)) setActive("inicio");
  }, [visibles, active]);

  const current = MODULES.find((m) => m.id === active) ?? MODULES[0]!;
  const accesible = !current.recurso || puede(current.recurso, "VER");

  return (
    <div className="flex h-full bg-slate-50 text-navy-700">
      <Sidebar
        items={visibles}
        active={active}
        onSelect={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed((c) => !c)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-navy-700 lg:hidden">
              <IconMenu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-navy-700">{current.titulo}</h1>
              <p className="hidden text-xs text-slate-400 sm:block">{current.subtitulo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-[10px] font-bold text-white">{sesion.rolNombre.slice(0, 2).toUpperCase()}</span>
            <div className="leading-tight">
              <p className="text-xs font-bold text-navy-700">{sesion.usuario?.nombre ?? "Invitado"}</p>
              <p className="text-[10px] text-slate-400">{sesion.rolNombre}</p>
            </div>
          </div>
          <button
            onClick={() => { cerrarSesion(); navigate("/"); }}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 hover:text-navy-700"
          >
            {autenticado ? "Cerrar sesión" : "Iniciar sesión"}
          </button>
        </div>

        {/* Contenido del módulo */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-6">
            {accesible ? (
              <div key={active + sesion.rolNombre} className="animate-fade-in">{current.render()}</div>
            ) : (
              <Card className="p-2">
                <EmptyState
                  icon={<IconLock />}
                  title="Acceso restringido"
                  hint={`El rol "${sesion.rolNombre}" no tiene permiso para ver este módulo.`}
                />
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
