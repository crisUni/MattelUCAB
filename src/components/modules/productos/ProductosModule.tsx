import { useEffect, useMemo, useState } from "react";
import { SubTabs, type SubTab } from "../../ui/primitives";
import { useSession } from "../../../context/SessionContext";
import { IconDna, IconLayers, IconLink, IconUsers, IconBriefcase, IconBox } from "../../ui/icons";
import { CatalogoTab } from "./CatalogoTab";
import { MaestrosTab } from "./MaestrosTab";
import { CompatibilidadTab } from "./CompatibilidadTab";
import { PersonajesTab } from "./PersonajesTab";
import { MultiversoTab } from "./MultiversoTab";
import { PacksTab } from "./PacksTab";
import { TrazabilidadTab } from "./TrazabilidadTab";

/** Cada subpestaña requiere VER sobre su recurso para mostrarse. */
const TABS: (SubTab & { recurso: string })[] = [
  { id: "catalogo", label: "Catálogo (ADN)", icon: <IconDna className="h-4 w-4" />, recurso: "PRODUCTO" },
  { id: "maestros", label: "Catálogos maestros", icon: <IconLayers className="h-4 w-4" />, recurso: "MOLDE_ROSTRO" },
  { id: "compat", label: "Compatibilidad", icon: <IconLink className="h-4 w-4" />, recurso: "COMPATIBILIDAD" },
  { id: "personajes", label: "Personajes", icon: <IconUsers className="h-4 w-4" />, recurso: "PERSONAJE" },
  { id: "multiverso", label: "Multiverso laboral", icon: <IconBriefcase className="h-4 w-4" />, recurso: "PROFESION" },
  { id: "packs", label: "Packs", icon: <IconBox className="h-4 w-4" />, recurso: "PACK" },
  { id: "trazabilidad", label: "Trazabilidad de diseño", icon: <IconUsers className="h-4 w-4" />, recurso: "PRODUCTO" },
];

export function ProductosModule() {
  const { puede } = useSession();
  const visibles = useMemo(() => TABS.filter((t) => puede(t.recurso, "VER")), [puede]);
  const [tab, setTab] = useState("catalogo");

  // Si la pestaña activa deja de ser visible (cambio de rol), salta a la primera disponible.
  useEffect(() => {
    if (visibles.length && !visibles.some((t) => t.id === tab)) setTab(visibles[0]!.id);
  }, [visibles, tab]);

  return (
    <div>
      <SubTabs tabs={visibles} active={tab} onChange={setTab} />
      {tab === "catalogo" && <CatalogoTab />}
      {tab === "maestros" && <MaestrosTab />}
      {tab === "compat" && <CompatibilidadTab />}
      {tab === "personajes" && <PersonajesTab />}
      {tab === "multiverso" && <MultiversoTab />}
      {tab === "packs" && <PacksTab />}
      {tab === "trazabilidad" && <TrazabilidadTab />}
    </div>
  );
}
