/** Primitivas de UI reutilizables, con la línea visual de marca. */
import { useEffect, useState } from "react";
import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, CSSProperties } from "react";

/* ------------------------------- Formatos ----------------------------- */
export function fmtUsd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n < 100 ? 2 : 0 }).format(n);
}
export function fmtNum(n: number): string {
  return new Intl.NumberFormat("es-VE").format(n);
}
export function fmtFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-VE", { year: "numeric", month: "short", day: "2-digit" });
}

/* -------------------------------- Badge ------------------------------- */
const badgeTones: Record<string, string> = {
  brand: "bg-brand-100 text-brand-700 ring-brand-200",
  navy: "bg-navy-100 text-navy-700 ring-navy-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
  gold: "bg-yellow-50 text-yellow-700 ring-yellow-300",
  black: "bg-zinc-900 text-zinc-50 ring-zinc-700",
  platinum: "bg-gradient-to-r from-slate-200 to-slate-100 text-slate-800 ring-slate-300",
};
export function Badge({ tone = "slate", children, className = "" }: { tone?: keyof typeof badgeTones | string; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${badgeTones[tone] ?? badgeTones.slate} ${className}`}>
      {children}
    </span>
  );
}

/* -------------------------------- Card -------------------------------- */
export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div style={style} className={`rounded-2xl border border-slate-200 bg-white shadow-soft ${className}`}>{children}</div>;
}

export function SectionHeader({ title, subtitle, action, icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-grape-500 text-white shadow-brand">{icon}</div>}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-navy-700">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ StatCard ------------------------------ */
export function StatCard({ label, value, hint, tone = "brand", icon }: { label: string; value: ReactNode; hint?: string; tone?: "brand" | "navy" | "green" | "amber"; icon?: ReactNode }) {
  const tones = {
    brand: "from-brand-500 to-grape-500",
    navy: "from-navy-600 to-navy-400",
    green: "from-emerald-500 to-teal-500",
    amber: "from-amber-500 to-orange-500",
  } as const;
  return (
    <Card className="group relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tones[tone]} opacity-10 transition-transform duration-500 group-hover:scale-150`} />
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {icon && <span className={`bg-gradient-to-br ${tones[tone]} bg-clip-text text-transparent`}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-extrabold text-navy-700">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}

/* ------------------------------- Toggle ------------------------------- */
export function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-40 ${checked ? "bg-gradient-to-r from-brand-500 to-grape-500" : "bg-slate-300"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

/* ------------------------------ SubTabs ------------------------------- */
export interface SubTab { id: string; label: string; icon?: ReactNode }
export function SubTabs({ tabs, active, onChange }: { tabs: SubTab[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white/70 p-1 backdrop-blur">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-300 ${on ? "bg-gradient-to-r from-brand-500 to-grape-500 text-white shadow-brand" : "text-slate-500 hover:bg-slate-100 hover:text-navy-700"}`}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Skeleton ------------------------------ */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-200/70 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2.5 p-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

/* ----------------------------- EmptyState ----------------------------- */
export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-400">{icon}</div>
      <p className="text-sm font-semibold text-navy-700">{title}</p>
      {hint && <p className="max-w-sm text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/* --------------------------- Form controls ---------------------------- */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 placeholder:text-slate-300";
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

/**
 * Input numérico robusto: mantiene el texto tecleado (permite vaciar la caja y
 * escribir libremente, sin forzar 0 en cada tecla) y reporta el número. Vacío = 0.
 */
export function NumberInput({ value, onChange, className, ...rest }:
  Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & { value: number; onChange: (n: number) => void }) {
  const [txt, setTxt] = useState(value ? String(value) : "");
  useEffect(() => {
    setTxt((prev) => (Number(prev || 0) === value ? prev : value ? String(value) : ""));
  }, [value]);
  return (
    <input {...rest} type="number" inputMode="decimal" value={txt}
      onChange={(e) => { setTxt(e.target.value); onChange(e.target.value === "" ? 0 : Number(e.target.value)); }}
      className={`${inputCls} ${className ?? ""}`} />
  );
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

/* ------------------------------- Button ------------------------------- */
export function Button({ variant = "primary", children, className = "", ...rest }: { variant?: "primary" | "ghost" | "outline" | "danger" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: "bg-gradient-to-r from-brand-500 to-grape-500 text-white shadow-brand hover:shadow-lg hover:brightness-105",
    outline: "border border-slate-200 bg-white text-navy-700 hover:border-brand-300 hover:text-brand-600",
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-navy-700",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  } as const;
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------- Label exclusividad ------------------------- */
export function LabelChip({ codigo }: { codigo: string }) {
  const map: Record<string, { tone: string; txt: string }> = {
    PINK: { tone: "brand", txt: "Pink Label" },
    BLACK: { tone: "black", txt: "Black Label" },
    GOLD: { tone: "gold", txt: "Gold Label" },
    PLATINUM: { tone: "platinum", txt: "Platinum Label" },
  };
  const m = map[codigo] ?? { tone: "slate", txt: codigo };
  return <Badge tone={m.tone}>{m.txt}</Badge>;
}
