/**
 * Acentos decorativos con iconografía Barbie.
 * Capa puramente estética (aria-hidden) para hero/banners.
 */
import type { ReactElement, SVGProps } from "react";
import { IconHeel, IconTiara, IconHeart, IconSparkles, IconBow, IconDiamond, IconFlower, IconLipstick } from "./icons";

interface Accent { Icon: (p: SVGProps<SVGSVGElement>) => ReactElement; className: string; size: number; }

const HERO_ACCENTS: Accent[] = [
  { Icon: IconTiara, className: "left-[6%] top-[18%] rotate-[-10deg]", size: 30 },
  { Icon: IconHeel, className: "right-[10%] top-[22%] rotate-[12deg]", size: 28 },
  { Icon: IconHeart, className: "left-[24%] bottom-[14%] rotate-[8deg]", size: 22 },
  { Icon: IconSparkles, className: "right-[26%] bottom-[20%]", size: 26 },
  { Icon: IconBow, className: "left-[46%] top-[10%] rotate-[6deg]", size: 22 },
  { Icon: IconDiamond, className: "right-[44%] top-[60%] rotate-[-8deg]", size: 20 },
];

/** Confeti de íconos para fondos oscuros/degradados (usa texto blanco translúcido). */
export function BarbieConfetti({ tone = "light" }: { tone?: "light" | "brand" }) {
  const color = tone === "light" ? "text-white/15" : "text-brand-300/30";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {HERO_ACCENTS.map(({ Icon, className, size }, i) => (
        <span
          key={i}
          style={{ width: size, height: size, animationDelay: `${i * 0.35}s` }}
          className={`absolute animate-pulse-soft ${color} ${className}`}
        >
          <Icon width={size} height={size} />
        </span>
      ))}
    </div>
  );
}

/** Fila de íconos para encabezados/footers. */
export function BarbieIconRow({ className = "" }: { className?: string }) {
  const icons = [IconTiara, IconHeel, IconHeart, IconBow, IconLipstick, IconFlower, IconDiamond, IconSparkles];
  return (
    <div aria-hidden className={`flex items-center gap-3 ${className}`}>
      {icons.map((Icon, i) => <Icon key={i} className="h-4 w-4" />)}
    </div>
  );
}
