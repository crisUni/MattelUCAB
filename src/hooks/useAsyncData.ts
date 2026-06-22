import { useEffect, useState } from "react";

/**
 * Carga datos asíncronos (hoy desde el mock vía api.ts) exponiendo
 * estado de carga y permitiendo mutación local en memoria para los CRUD
 * visuales (sin persistencia real).
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    loader()
      .then((d) => { if (alive) { setData(d); setLoading(false); } })
      .catch((e) => {
        // Sin esto, un fallo de carga deja el skeleton girando para siempre.
        if (alive) { setError(e instanceof Error ? e.message : String(e)); setLoading(false); }
        console.error("useAsyncData loader failed:", e);
      });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error };
}
