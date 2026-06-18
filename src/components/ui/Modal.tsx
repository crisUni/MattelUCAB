/** Modal accesible con animación de entrada y overlay. */
import { useEffect, type ReactNode } from "react";
import { IconClose, IconWarn } from "./icons";
import { Button } from "./primitives";

export function Modal({
  open, onClose, title, subtitle, children, footer, size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" } as const;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 animate-fade-in-fast bg-navy-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${widths[size]} animate-scale-in overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-brand-50 to-white px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-navy-700">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-navy-700">
            <IconClose />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open, onCancel, onConfirm, title, message, confirmLabel = "Eliminar", danger = true,
}: {
  open: boolean; onCancel: () => void; onConfirm: () => void;
  title: string; message: string; confirmLabel?: string; danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${danger ? "bg-rose-50 text-rose-500" : "bg-brand-50 text-brand-500"}`}>
          <IconWarn />
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      </div>
    </Modal>
  );
}
