/** Set mínimo de íconos SVG (stroke) para no añadir dependencias. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...props,
});

export const IconUsers = (p: P) => (<svg {...base(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
export const IconDna = (p: P) => (<svg {...base(p)}><path d="M4 2c0 4 8 6 8 10s-8 6-8 10" /><path d="M20 2c0 4-8 6-8 10s8 6 8 10" /><path d="M5 6h14M6.5 9h11M6.5 15h11M5 18h14" /></svg>);
export const IconReport = (p: P) => (<svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h2v5H8zM14 11h2v7h-2z" /></svg>);
export const IconShield = (p: P) => (<svg {...base(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>);
export const IconKey = (p: P) => (<svg {...base(p)}><circle cx="7.5" cy="15.5" r="4.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></svg>);
export const IconGrid = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>);
export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>);
export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconEdit = (p: P) => (<svg {...base(p)}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>);
export const IconTrash = (p: P) => (<svg {...base(p)}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
export const IconLock = (p: P) => (<svg {...base(p)}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
export const IconClose = (p: P) => (<svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const IconChevron = (p: P) => (<svg {...base(p)}><path d="m9 18 6-6-6-6" /></svg>);
export const IconChevronDown = (p: P) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>);
export const IconWarn = (p: P) => (<svg {...base(p)}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>);
export const IconBan = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></svg>);
export const IconMenu = (p: P) => (<svg {...base(p)}><path d="M3 12h18M3 6h18M3 18h18" /></svg>);
export const IconDownload = (p: P) => (<svg {...base(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>);
export const IconClock = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IconBox = (p: P) => (<svg {...base(p)}><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></svg>);
export const IconHome = (p: P) => (<svg {...base(p)}><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /><path d="M9 21v-7h6v7" /></svg>);
export const IconCar = (p: P) => (<svg {...base(p)}><path d="M5 17h14M3 17l2-6h14l2 6M6 17v2M18 17v2" /><circle cx="7.5" cy="17" r="0" /></svg>);
export const IconLink = (p: P) => (<svg {...base(p)}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></svg>);
export const IconSpark = (p: P) => (<svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /><circle cx="12" cy="12" r="2.5" /></svg>);
export const IconCoin = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5a2.5 2 0 0 1 5 0c0 1.4-1.5 1.8-2.5 2s-2.5.6-2.5 2a2.5 2 0 0 0 5 0" /></svg>);
export const IconEye = (p: P) => (<svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>);
export const IconScale = (p: P) => (<svg {...base(p)}><path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0Zm14 0-3 7a3 3 0 0 0 6 0ZM7 21h10" /></svg>);
export const IconBriefcase = (p: P) => (<svg {...base(p)}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h20" /></svg>);
export const IconLayers = (p: P) => (<svg {...base(p)}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></svg>);
export const IconFlask = (p: P) => (<svg {...base(p)}><path d="M9 3h6M10 3v6L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3" /><path d="M7.5 15h9" /></svg>);

/* --- Iconografía temática Barbie (acentos decorativos) --- */
export const IconHeart = (p: P) => (<svg {...base(p)}><path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" /></svg>);
export const IconSparkles = (p: P) => (<svg {...base(p)}><path d="M12 3l1.6 4.8L18 9.4l-4.4 1.6L12 16l-1.6-5L6 9.4l4.4-1.6z" /><path d="M5.5 14l.8 2.3 2.2.8-2.2.8-.8 2.3-.8-2.3L2.5 17l2.2-.9z" /></svg>);
export const IconTiara = (p: P) => (<svg {...base(p)}><path d="M3 18h18M4 18l-1-8 5 4 4-7 4 7 5-4-1 8" /><circle cx="12" cy="5.5" r="1" /></svg>);
export const IconBow = (p: P) => (<svg {...base(p)}><path d="M12 12 5 8.5v7L12 12l7 3.5v-7L12 12Z" /><circle cx="12" cy="12" r="1.6" /></svg>);
export const IconLipstick = (p: P) => (<svg {...base(p)}><path d="M9 21h5v-8H9z" /><path d="M9.5 13V8l3-5 1.2.7L11.5 8v5" /></svg>);
export const IconHanger = (p: P) => (<svg {...base(p)}><path d="M12 5a2 2 0 0 1 1.2 3.6c-.5.4-.7.7-.7 1.1 0 .5.3.8.9 1.1l6.8 3.4a2 2 0 0 1-.9 3.8H4.7a2 2 0 0 1-.9-3.8l8.2-4.1" /></svg>);
export const IconDiamond = (p: P) => (<svg {...base(p)}><path d="M5 4h14l3 5-10 12L2 9z" /><path d="M2 9h20M8 4 6 9l6 8 6-8-2-5" /></svg>);
export const IconFlower = (p: P) => (<svg {...base(p)}><circle cx="12" cy="6.5" r="2" /><circle cx="17.5" cy="10.5" r="2" /><circle cx="15.5" cy="17" r="2" /><circle cx="8.5" cy="17" r="2" /><circle cx="6.5" cy="10.5" r="2" /><circle cx="12" cy="12" r="2.2" /></svg>);
export const IconHeel = (p: P) => (<svg {...base(p)}><path d="M3 8c5 1 8 3.4 11 5.9 1.6 1.3 3 1.7 5 1.7v2.4H8l-2-3H3z" /><path d="M19 18 21 21" /></svg>);
