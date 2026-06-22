import { useState } from "react";
import { SubTabs, type SubTab } from "../../ui/primitives";
import { IconUsers, IconShield, IconGrid, IconBriefcase } from "../../ui/icons";
import { UsuariosTab } from "./UsuariosTab";
import { RolesTab } from "./RolesTab";
import { MatrizTab } from "./MatrizTab";
import { EmpleadosTab } from "./EmpleadosTab";
import { ClientesTab } from "./ClientesTab";

const TABS: SubTab[] = [
  { id: "usuarios", label: "Usuarios", icon: <IconUsers className="h-4 w-4" /> },
  { id: "empleados", label: "Empleados", icon: <IconBriefcase className="h-4 w-4" /> },
  { id: "clientes", label: "Clientes", icon: <IconUsers className="h-4 w-4" /> },
  { id: "roles", label: "Roles", icon: <IconShield className="h-4 w-4" /> },
  { id: "matriz", label: "Matriz de permisos", icon: <IconGrid className="h-4 w-4" /> },
];

export function UsuariosModule() {
  const [tab, setTab] = useState("usuarios");
  return (
    <div>
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "usuarios" && <UsuariosTab />}
      {tab === "empleados" && <EmpleadosTab />}
      {tab === "clientes" && <ClientesTab />}
      {tab === "roles" && <RolesTab />}
      {tab === "matriz" && <MatrizTab />}
    </div>
  );
}
