/**
 * Contexto de sesión + control de acceso (RBAC).
 *
 * La sesión arranca como INVITADO = rol "Cliente" (catálogo de solo lectura).
 * Al iniciar sesión se reemplaza por el usuario real y sus permisos, todo
 * resuelto en la base de datos (POST /api/login). El front sólo filtra
 * pantallas y botones según `puede(recurso, accion)`.
 */
import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import {
  login as apiLogin, getPermisosDeRol, type PermisoSesion,
} from "../services/api";
import type { AccionPermiso } from "../data/types";

interface Sesion {
  /** null = invitado (no autenticado). */
  usuario: { id: string; nombre: string } | null;
  rolNombre: string;
  permisos: PermisoSesion[];
}

interface SessionValue {
  sesion: Sesion;
  esInvitado: boolean;
  autenticado: boolean;
  /** Inicia sesión contra la BD. Devuelve false si las credenciales no coinciden. */
  iniciarSesion: (usuario: string, clave: string) => Promise<boolean>;
  /** Entra como invitado (rol Cliente). */
  entrarComoInvitado: () => Promise<void>;
  cerrarSesion: () => void;
  /** ¿La sesión actual puede ejecutar `accion` sobre `recurso`? */
  puede: (recurso: string, accion: AccionPermiso) => boolean;
  /** ¿Puede ver costos/márgenes? (permiso VER sobre COSTO). */
  puedeVerCostos: boolean;
}

const INVITADO: Sesion = { usuario: null, rolNombre: "Cliente", permisos: [] };

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>(INVITADO);

  // Carga los permisos del rol Cliente para la sesión de invitado por defecto.
  useEffect(() => {
    let alive = true;
    getPermisosDeRol("Cliente").then((permisos) => {
      if (alive) setSesion((s) => (s.usuario ? s : { ...INVITADO, permisos }));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const value = useMemo<SessionValue>(() => {
    const puede = (recurso: string, accion: AccionPermiso) =>
      sesion.permisos.some((p) => p.recurso === recurso && p.accion === accion);

    return {
      sesion,
      esInvitado: sesion.usuario === null,
      autenticado: sesion.usuario !== null,
      iniciarSesion: async (usuario: string, clave: string) => {
        const r = await apiLogin(usuario, clave);
        if (!r) return false;
        setSesion({ usuario: r.usuario, rolNombre: r.rol.nombre, permisos: r.permisos });
        return true;
      },
      entrarComoInvitado: async () => {
        const permisos = await getPermisosDeRol("Cliente");
        setSesion({ ...INVITADO, permisos });
      },
      cerrarSesion: () => {
        getPermisosDeRol("Cliente").then((permisos) => setSesion({ ...INVITADO, permisos }));
      },
      puede,
      puedeVerCostos: puede("COSTO", "VER"),
    };
  }, [sesion]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
