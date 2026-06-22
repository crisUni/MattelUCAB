import type { Producto, Usuario } from "../data/types";
import { getProductos, getUsuarios } from "../services/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { useSession } from "../context/SessionContext";
import { Card, StatCard, Badge, fmtUsd } from "../components/ui/primitives";
import { IconDna, IconUsers, IconBox, IconScale, IconSpark } from "../components/ui/icons";
import { BarbieConfetti } from "../components/ui/Decor";

export function InicioView() {
  const { sesion, puedeVerCostos, puede } = useSession();
  const { data: productos } = useAsyncData<Producto[]>(getProductos);
  const { data: usuarios } = useAsyncData<Usuario[]>(getUsuarios);

  const total = productos?.length ?? 0;
  const agotados = (productos ?? []).filter((p) => p.stock === 0).length;
  const valorInventario = (productos ?? []).reduce((s, p) => s + p.precioBaseUsd * p.stock, 0);
  const totalUsuarios = usuarios?.length ?? 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-brand-500 via-grape-500 to-navy-700 p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rotate-12 bg-white/5" style={{ clipPath: "polygon(0 0,100% 0,100% 100%)" }} />
        <BarbieConfetti tone="light" />
        <div className="relative">
          <Badge tone="platinum"><IconSpark className="h-3 w-3" />Sistema PLM · Dream Legacy</Badge>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Bienvenido a MattelUCAB</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/80">
            Plataforma unificada de gestión del ciclo de vida del producto: ERP corporativo
            y portal de e-commerce. Estás operando como <b>{sesion.rolNombre}</b>.
          </p>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Productos en catálogo" value={total} hint="SKUs activos" tone="brand" icon={<IconDna className="h-5 w-5" />} />
        <StatCard label="Productos agotados" value={agotados} hint="sin stock disponible" tone="navy" icon={<IconBox className="h-5 w-5" />} />
        <StatCard label="Usuarios registrados" value={totalUsuarios} hint="cuentas del sistema" tone="green" icon={<IconUsers className="h-5 w-5" />} />
        <StatCard
          label="Valor de inventario"
          value={puedeVerCostos ? fmtUsd(valorInventario) : "•••••"}
          hint={puedeVerCostos ? "precio × stock" : "oculto para tu rol"}
          tone="amber"
          icon={<IconScale className="h-5 w-5" />}
        />
      </div>

      {/* Accesos según permisos */}
      <div>
        <p className="mb-3 text-sm font-bold text-navy-700">Tus accesos</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AccesoCard show={puede("USUARIO", "VER")} icon={<IconUsers className="h-5 w-5" />} title="Usuarios & Seguridad" desc="Usuarios, roles, permisos y matriz." />
          <AccesoCard show={puede("PRODUCTO", "VER")} icon={<IconDna className="h-5 w-5" />} title="Genoma Barbie" desc="Catálogo ADN, compatibilidad, multiverso y packs." />
          <AccesoCard show={puede("REPORTE", "VER")} icon={<IconScale className="h-5 w-5" />} title="Reportes" desc="Rentabilidad, diversidad, scalpers y documentos." />
        </div>
      </div>
    </div>
  );
}

function AccesoCard({ show, icon, title, desc }: { show: boolean; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className={`p-5 transition-all duration-300 ${show ? "hover:-translate-y-1 hover:shadow-brand" : "opacity-50"}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl text-white ${show ? "bg-gradient-to-br from-brand-500 to-grape-500" : "bg-slate-300"}`}>{icon}</span>
        <div>
          <p className="font-bold text-navy-700">{title}</p>
          <Badge tone={show ? "green" : "slate"}>{show ? "Habilitado" : "Sin acceso"}</Badge>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{desc}</p>
    </Card>
  );
}
