/**
 * Contexto de sesión + simulador de rol.
 *
 * Mantiene en memoria (sin localStorage) el rol con el que se "inicia sesión"
 * para demostrar cómo cambian menús, columnas sensibles y acciones según el perfil.
 * La navegación y los permisos del resto de la app se derivan de aquí.
 */
import {
  createContext, useContext, useMemo, useState, type ReactNode,
} from "react";
import { roles as rolesMock, permisos as permisosMock } from "../data/mock/seguridad";
import type { Rol, Permiso, Ambito } from "../data/types";

interface SessionValue {
  roles: Rol[];
  permisos: Permiso[];
  rolActual: Rol;
  setRolActualId: (id: string) => void;
  /** ¿El rol actual tiene este permiso (por id)? */
  can: (permisoId: string) => boolean;
  /** ¿Tiene algún permiso del módulo indicado? */
  canModulo: (modulo: string) => boolean;
  /** ¿Puede ver datos sensibles (costos / márgenes)? */
  puedeVerSensible: boolean;
  isBackOffice: boolean;
  ambito: Ambito;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // Por defecto se inicia como Administrador (acceso total) para la demo.
  const [rolActualId, setRolActualId] = useState<string>("rol-admin");

  const value = useMemo<SessionValue>(() => {
    const rolActual =
      rolesMock.find((r) => r.id === rolActualId) ?? rolesMock[0]!;
    const permisosSet = new Set(rolActual.permisosIds);
    const can = (permisoId: string) => permisosSet.has(permisoId);
    const canModulo = (modulo: string) =>
      permisosMock.some(
        (p) => p.modulo === modulo && permisosSet.has(p.id)
      );
    const puedeVerSensible = permisosMock.some(
      (p) => p.sensible && permisosSet.has(p.id)
    );
    return {
      roles: rolesMock,
      permisos: permisosMock,
      rolActual,
      setRolActualId,
      can,
      canModulo,
      puedeVerSensible,
      isBackOffice: rolActual.ambito === "BACK_OFFICE",
      ambito: rolActual.ambito,
    };
  }, [rolActualId]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
