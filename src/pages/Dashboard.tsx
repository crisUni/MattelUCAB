import { useEffect, useMemo, useState } from "react";
import { useSession } from "../context/SessionContext";
import { Sidebar, type NavItem } from "../components/layout/Sidebar";
import { RoleSelector } from "../components/layout/RoleSelector";
import { Footer } from "../components/layout/Footer";
import { Card, EmptyState } from "../components/ui/primitives";
import { IconUsers, IconDna, IconReport, IconHome, IconLock, IconMenu } from "../components/ui/icons";
import { UsuariosModule } from "../components/modules/usuarios/UsuariosModule";
import { ProductosModule } from "../components/modules/productos/ProductosModule";
import { ReportesModule } from "../components/modules/reportes/ReportesModule";
import { InicioView } from "./InicioView";

interface ModuleDef extends NavItem {
  /** Permiso requerido para ver el módulo (undefined = siempre visible). */
  permiso?: string;
  render: () => React.ReactNode;
  titulo: string;
  subtitulo: string;
}

const MODULES: ModuleDef[] = [
  { id: "inicio", label: "Inicio", icon: <IconHome className="h-5 w-5" />, scope: "AMBOS", render: () => <InicioView />, titulo: "Panel principal", subtitulo: "Resumen del sistema Dream Legacy" },
  { id: "usuarios", label: "Usuarios & Seguridad", icon: <IconUsers className="h-5 w-5" />, scope: "BACK_OFFICE", permiso: "perm-usuarios-admin", render: () => <UsuariosModule />, titulo: "Gestión de Usuarios, Roles y Privilegios", subtitulo: "Hermeticidad de la información según el perfil" },
  { id: "productos", label: "Genoma Barbie", icon: <IconDna className="h-5 w-5" />, scope: "AMBOS", permiso: "perm-prod-ver", render: () => <ProductosModule />, titulo: "Catálogo y Diseño de Productos", subtitulo: "El ADN de cada muñeca y sus reglas de compatibilidad" },
  { id: "reportes", label: "Reportes", icon: <IconReport className="h-5 w-5" />, scope: "AMBOS", permiso: "perm-reportes-ver", render: () => <ReportesModule />, titulo: "Reportes", subtitulo: "Visores tipo JasperReports" },
];

export function Dashboard() {
  const { can, rolActual } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("inicio");

  const visibles = useMemo(
    () => MODULES.filter((m) => !m.permiso || can(m.permiso)),
    [can]
  );

  // Si al cambiar de rol el módulo activo deja de ser visible, vuelve a Inicio.
  useEffect(() => {
    if (!visibles.some((m) => m.id === active)) setActive("inicio");
  }, [visibles, active]);

  const current = MODULES.find((m) => m.id === active) ?? MODULES[0]!;
  const accesible = !current.permiso || can(current.permiso);

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
          <div className="flex items-center gap-3">
            <RoleSelector />
          </div>
        </div>

        {/* Contenido del módulo */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-5 py-6">
            {accesible ? (
              <div key={active + rolActual.id} className="animate-fade-in">{current.render()}</div>
            ) : (
              <Card className="p-2">
                <EmptyState
                  icon={<IconLock />}
                  title="Acceso restringido"
                  hint={`El rol "${rolActual.nombre}" no tiene permiso para ver este módulo. Cambia de rol en el simulador de sesión.`}
                />
              </Card>
            )}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
