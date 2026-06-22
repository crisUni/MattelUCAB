import { useState } from "react";
import type { Personaje, TipoVinculo } from "../../../data/types";
import { getPersonajes, crearPersonaje, eliminarPersonaje } from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { Card, Badge, SectionHeader, Skeleton, Button, Field, TextInput, NumberInput, Select } from "../../ui/primitives";
import { Modal, ConfirmDialog } from "../../ui/Modal";
import { IconUsers, IconLink, IconPlus, IconTrash } from "../../ui/icons";

const vinculoTone: Record<TipoVinculo, string> = {
  PAREJA: "brand", HERMANA: "navy", AMIGA: "green", RIVAL: "red", MASCOTA: "amber",
};
const vinculoLabel: Record<TipoVinculo, string> = {
  PAREJA: "Pareja", HERMANA: "Hermana", AMIGA: "Amiga", RIVAL: "Rival", MASCOTA: "Mascota",
};
const TIPOS = ["Pareja", "Hermana", "Amiga", "Rival", "Mascota"];

export function PersonajesTab() {
  const { puede } = useSession();
  const puedeCrear = puede("PERSONAJE", "CREAR");
  const puedeEliminar = puede("PERSONAJE", "ELIMINAR");
  const { data: personajes, setData, loading } = useAsyncData<Personaje[]>(getPersonajes);
  const [creando, setCreando] = useState(false);
  const [confirm, setConfirm] = useState<Personaje | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nombre = (id: string) => personajes?.find((p) => p.id === id)?.nombre ?? id;

  const recargar = async () => setData(await getPersonajes());
  async function borrar(p: Personaje) {
    setError(null);
    try { await eliminarPersonaje(p.id); setConfirm(null); await recargar(); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); setConfirm(null); }
  }

  return (
    <div className="animate-fade-in">
      <SectionHeader icon={<IconUsers className="h-5 w-5" />} title="Personajes y Vínculos"
        subtitle="La familia y el círculo de Barbie: cada personaje tiene un molde de rostro y vínculos (pareja, hermana, amiga, rival, mascota)."
        action={puedeCrear ? <Button onClick={() => setCreando(true)}><IconPlus className="h-4 w-4" />Nuevo personaje</Button> : undefined}
      />
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(personajes ?? []).map((p, i) => (
            <Card key={p.id} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in overflow-hidden p-0">
              <div className="flex items-center gap-3 bg-gradient-to-r from-brand-500 to-grape-500 p-4 text-white">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-lg font-extrabold backdrop-blur">{p.nombre[0]}</span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-lg font-bold">{p.nombre}</p>
                  <p className="text-xs text-white/80">{p.vinculos.length} vínculo{p.vinculos.length === 1 ? "" : "s"}</p>
                </div>
                {puedeEliminar && (
                  <button title="Eliminar" onClick={() => setConfirm(p)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 text-white transition hover:bg-white/30">
                    <IconTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="p-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400"><IconLink className="h-3.5 w-3.5" />Vínculos</p>
                <div className="space-y-1.5">
                  {p.vinculos.length === 0 && <p className="text-xs text-slate-400">Sin vínculos.</p>}
                  {p.vinculos.map((v) => (
                    <div key={v.personajeId + v.tipo} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                      <span className="text-sm text-navy-700">{nombre(v.personajeId)}</span>
                      <Badge tone={vinculoTone[v.tipo]}>{vinculoLabel[v.tipo]}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {creando && <NuevoPersonajeForm personajes={personajes ?? []} onCancel={() => setCreando(false)} onSaved={async () => { setCreando(false); await recargar(); }} />}
      <ConfirmDialog open={!!confirm} title="Eliminar personaje" message={`¿Eliminar a ${confirm?.nombre}? Se borrarán sus vínculos y su molde.`} onCancel={() => setConfirm(null)} onConfirm={() => confirm && borrar(confirm)} />
    </div>
  );
}

function NuevoPersonajeForm({ personajes, onCancel, onSaved }: { personajes: Personaje[]; onCancel: () => void; onSaved: () => void }) {
  const [nombre, setNombre] = useState("");
  const [moldeNombre, setMoldeNombre] = useState("");
  const [moldePatente, setMoldePatente] = useState("");
  const [moldeAno, setMoldeAno] = useState(new Date().getFullYear());
  const [vinculos, setVinculos] = useState<{ personajeId: string; tipo: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function submit() {
    setError(null);
    if (!nombre.trim()) { setError("Indica el nombre del personaje."); return; }
    if (!moldeNombre.trim() || !moldePatente.trim()) { setError("El personaje necesita un molde de rostro (nombre y patente)."); return; }
    setGuardando(true);
    try {
      await crearPersonaje({
        nombre: nombre.trim(), moldeNombre: moldeNombre.trim(), moldePatente: moldePatente.trim(), moldeAno,
        vinculos: vinculos.filter((v) => v.personajeId),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal open onClose={onCancel} size="lg"
      title="Nuevo personaje"
      subtitle="Cada personaje se crea con un molde de rostro asociado. Opcionalmente, define vínculos con personajes existentes."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Creando…" : "Crear"}</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del personaje"><TextInput value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Barbie, Ken, Skipper…" /></Field>
      </div>

      <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-brand-600">Molde de rostro asociado</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del molde"><TextInput value={moldeNombre} onChange={(e) => setMoldeNombre(e.target.value)} placeholder="Superstar, Mackie…" /></Field>
        <Field label="Código de patente"><TextInput value={moldePatente} onChange={(e) => setMoldePatente(e.target.value)} placeholder="PAT-MOL-011" /></Field>
        <Field label="Año de patente"><NumberInput value={moldeAno} onChange={setMoldeAno} /></Field>
      </div>

      <div className="mb-2 mt-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Vínculos (opcional)</p>
        <Button variant="outline" onClick={() => setVinculos((v) => [...v, { personajeId: "", tipo: "Amiga" }])}>
          <IconPlus className="h-4 w-4" />Añadir vínculo
        </Button>
      </div>
      {vinculos.length === 0 ? (
        <p className="text-xs text-slate-400">Sin vínculos. Puedes relacionarlo con otros personajes.</p>
      ) : (
        <div className="space-y-2">
          {vinculos.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_9rem_auto] items-end gap-2">
              <Field label="Personaje">
                <Select value={row.personajeId} onChange={(e) => setVinculos((v) => v.map((r, i) => i === idx ? { ...r, personajeId: e.target.value } : r))}>
                  <option value="">— Selecciona —</option>
                  {personajes.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </Select>
              </Field>
              <Field label="Relación">
                <Select value={row.tipo} onChange={(e) => setVinculos((v) => v.map((r, i) => i === idx ? { ...r, tipo: e.target.value } : r))}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Button variant="ghost" onClick={() => setVinculos((v) => v.filter((_, i) => i !== idx))}>Quitar</Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
