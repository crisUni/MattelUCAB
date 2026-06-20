import { useState } from "react";
import { SubTabs, type SubTab } from "../../ui/primitives";
import { IconUsers, IconShield, IconKey, IconGrid, IconSpark } from "../../ui/icons";
import { UsuariosTab } from "./UsuariosTab";
import { RolesTab } from "./RolesTab";
import { PermisosTab } from "./PermisosTab";
import { MatrizTab } from "./MatrizTab";
import { SimuladorTab } from "./SimuladorTab";

const TABS: SubTab[] = [
  { id: "usuarios", label: "Usuarios", icon: <IconUsers className="h-4 w-4" /> },
  { id: "roles", label: "Roles", icon: <IconShield className="h-4 w-4" /> },
  { id: "permisos", label: "Permisos", icon: <IconKey className="h-4 w-4" /> },
  { id: "matriz", label: "Matriz de permisos", icon: <IconGrid className="h-4 w-4" /> },
  { id: "simulador", label: "Simulador de sesión", icon: <IconSpark className="h-4 w-4" /> },
];

export function UsuariosModule() {
  const [tab, setTab] = useState("usuarios");
  return (
    <div>
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "usuarios" && <UsuariosTab />}
      {tab === "roles" && <RolesTab />}
      {tab === "permisos" && <PermisosTab />}
      {tab === "matriz" && <MatrizTab />}
      {tab === "simulador" && <SimuladorTab />}
    </div>
  );
}
