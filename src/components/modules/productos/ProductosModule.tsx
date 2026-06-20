import { useState } from "react";
import { SubTabs, type SubTab } from "../../ui/primitives";
import { IconDna, IconLayers, IconLink, IconUsers, IconBriefcase, IconBox } from "../../ui/icons";
import { CatalogoTab } from "./CatalogoTab";
import { MaestrosTab } from "./MaestrosTab";
import { CompatibilidadTab } from "./CompatibilidadTab";
import { PersonajesTab } from "./PersonajesTab";
import { MultiversoTab } from "./MultiversoTab";
import { PacksTab } from "./PacksTab";

const TABS: SubTab[] = [
  { id: "catalogo", label: "Catálogo (ADN)", icon: <IconDna className="h-4 w-4" /> },
  { id: "maestros", label: "Catálogos maestros", icon: <IconLayers className="h-4 w-4" /> },
  { id: "compat", label: "Compatibilidad", icon: <IconLink className="h-4 w-4" /> },
  { id: "personajes", label: "Personajes", icon: <IconUsers className="h-4 w-4" /> },
  { id: "multiverso", label: "Multiverso laboral", icon: <IconBriefcase className="h-4 w-4" /> },
  { id: "packs", label: "Packs", icon: <IconBox className="h-4 w-4" /> },
];

export function ProductosModule() {
  const [tab, setTab] = useState("catalogo");
  return (
    <div>
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "catalogo" && <CatalogoTab />}
      {tab === "maestros" && <MaestrosTab />}
      {tab === "compat" && <CompatibilidadTab />}
      {tab === "personajes" && <PersonajesTab />}
      {tab === "multiverso" && <MultiversoTab />}
      {tab === "packs" && <PacksTab />}
    </div>
  );
}
