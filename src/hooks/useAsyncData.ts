import { useEffect, useState } from "react";

/**
 * Carga datos asíncronos (hoy desde el mock vía api.ts) exponiendo
 * estado de carga y permitiendo mutación local en memoria para los CRUD
 * visuales (sin persistencia real).
 */
export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loader().then((d) => {
      if (alive) {
        setData(d);
        setLoading(false);
      }
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading };
}
