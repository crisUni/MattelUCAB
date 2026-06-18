import { useState } from "react";
import { SubTabs, type SubTab } from "../../ui/primitives";
import { IconDna, IconScale, IconBan, IconReport, IconBox } from "../../ui/icons";
import { RentabilidadReport } from "./RentabilidadReport";
import { DiversidadReport } from "./DiversidadReport";
import { ScalpersReport } from "./ScalpersReport";
import { DocumentosReport } from "./DocumentosReport";
import { GrupoReport } from "./GrupoReport";

const TABS: SubTab[] = [
  { id: "rentabilidad", label: "Rentabilidad ADN", icon: <IconDna className="h-4 w-4" /> },
  { id: "diversidad", label: "Diversidad", icon: <IconScale className="h-4 w-4" /> },
  { id: "scalpers", label: "Monitor scalpers", icon: <IconBan className="h-4 w-4" /> },
  { id: "documentos", label: "Documentos", icon: <IconBox className="h-4 w-4" /> },
  { id: "grupo", label: "Reportes del Grupo", icon: <IconReport className="h-4 w-4" /> },
];

export function ReportesModule() {
  const [tab, setTab] = useState("rentabilidad");
  return (
    <div>
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "rentabilidad" && <RentabilidadReport />}
      {tab === "diversidad" && <DiversidadReport />}
      {tab === "scalpers" && <ScalpersReport />}
      {tab === "documentos" && <DocumentosReport />}
      {tab === "grupo" && <GrupoReport />}
    </div>
  );
}
