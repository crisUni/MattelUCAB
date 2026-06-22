import { useState } from "react";
import type { ReglaCompatibilidad } from "../../../data/types";
import {
  getReglasCompatibilidad, getJuguetesConProductoOpc, crearCompatibilidad, type Opcion,
} from "../../../services/api";
import { useAsyncData } from "../../../hooks/useAsyncData";
import { useSession } from "../../../context/SessionContext";
import { Card, Badge, SectionHeader, Skeleton, Button, Field, Select } from "../../ui/primitives";
import { Modal } from "../../ui/Modal";
import { IconCheck, IconLink, IconPlus } from "../../ui/icons";

export function CompatibilidadTab() {
  const { puede } = useSession();
  const puedeCrear = puede("COMPATIBILIDAD", "CREAR");
  const { data: reglas, setData, loading } = useAsyncData<ReglaCompatibilidad[]>(getReglasCompatibilidad);
  const [creando, setCreando] = useState(false);

  const recargar = async () => setData(await getReglasCompatibilidad());

  return (
    <div className="animate-fade-in">
      <SectionHeader
        icon={<IconLink className="h-5 w-5" />}
        title="Compatibilidad de Juguetes"
        subtitle="Pares de juguetes (genomas) registrados como compatibles entre sí. Solo los pares aquí declarados pueden agruparse en un set."
        action={puedeCrear ? <Button onClick={() => setCreando(true)}><IconPlus className="h-4 w-4" />Nueva compatibilidad</Button> : undefined}
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : (reglas ?? []).length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-400">No hay compatibilidades registradas.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(reglas ?? []).map((r, i) => (
            <Card key={r.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in flex items-center gap-3 p-4 ring-1 ring-emerald-200">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white"><IconCheck className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-semibold text-navy-700">{r.origen} ↔ {r.destino}</p>
                <p className="text-xs text-slate-400">Juguetes compatibles</p>
              </div>
              <Badge tone="green">Compatible</Badge>
            </Card>
          ))}
        </div>
      )}

      {creando && <NuevaCompatibilidadForm onCancel={() => setCreando(false)} onSaved={async () => { setCreando(false); await recargar(); }} />}
    </div>
  );
}

function NuevaCompatibilidadForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const { data: juguetes } = useAsyncData<Opcion[]>(getJuguetesConProductoOpc);
  const [jug1, setJug1] = useState("");
  const [jug2, setJug2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function submit() {
    setError(null);
    if (!jug1 || !jug2) { setError("Selecciona los dos juguetes."); return; }
    if (jug1 === jug2) { setError("La compatibilidad debe ser entre dos juguetes distintos."); return; }
    setGuardando(true);
    try {
      await crearCompatibilidad(jug1, jug2);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGuardando(false);
    }
  }

  const opts = juguetes ?? [];
  return (
    <Modal open onClose={onCancel} size="md"
      title="Nueva compatibilidad"
      subtitle="Declara que dos juguetes (genomas) son compatibles. La relación es simétrica: A ↔ B."
      footer={<><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button onClick={submit} disabled={guardando}>{guardando ? "Creando…" : "Crear"}</Button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Juguete A">
          <Select value={jug1} onChange={(e) => setJug1(e.target.value)}>
            <option value="">— Selecciona —</option>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </Select>
        </Field>
        <Field label="Juguete B">
          <Select value={jug2} onChange={(e) => setJug2(e.target.value)}>
            <option value="">— Selecciona —</option>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </Select>
        </Field>
      </div>
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}
