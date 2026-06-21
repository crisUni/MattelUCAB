import { useState } from "react";
import { SubTabs, type SubTab } from "../../ui/primitives";
import { IconUsers, IconShield, IconGrid } from "../../ui/icons";
import { UsuariosTab } from "./UsuariosTab";
import { RolesTab } from "./RolesTab";
import { MatrizTab } from "./MatrizTab";

const TABS: SubTab[] = [
  { id: "usuarios", label: "Usuarios", icon: <IconUsers className="h-4 w-4" /> },
  { id: "roles", label: "Roles", icon: <IconShield className="h-4 w-4" /> },
  { id: "matriz", label: "Matriz de permisos", icon: <IconGrid className="h-4 w-4" /> },
];

export function UsuariosModule() {
  const [tab, setTab] = useState("usuarios");
  return (
    <div>
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "usuarios" && <UsuariosTab />}
      {tab === "roles" && <RolesTab />}
      {tab === "matriz" && <MatrizTab />}
    </div>
  );
}
