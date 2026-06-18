import type { ReglaCompatibilidad, Dreamhouse, Pack } from "../types";

/** Reglas de "fits" — la lógica crítica de compatibilidad. */
export const reglasCompatibilidad: ReglaCompatibilidad[] = [
  {
    id: "fit-1", nombre: "Tacón arqueado → cuerpo Original",
    origen: "Tacones Stiletto (pie arqueado)", destino: "Barbie Original (pie arqueado)",
    resultado: "COMPATIBLE", motivo: "Ambos comparten pie arqueado. Ajuste perfecto.",
  },
  {
    id: "fit-2", nombre: "Tacón arqueado → cuerpo Made-to-Move",
    origen: "Tacones Stiletto (pie arqueado)", destino: "Made-to-Move (pie plano)",
    resultado: "INCOMPATIBLE", motivo: "Un zapato para pie arqueado no puede asociarse a una muñeca de pie plano.",
  },
  {
    id: "fit-3", nombre: "Zapatilla plana → cuerpo Curvy",
    origen: "Zapatillas deportivas (pie plano)", destino: "Fashionistas Curvy (pie plano)",
    resultado: "COMPATIBLE", motivo: "Pie plano en ambos. Compatible.",
  },
  {
    id: "fit-4", nombre: "Vestido Curvy → pack Petite",
    origen: "Vestido de gala (corte Curvy)", destino: "Pack cuerpo Petite",
    resultado: "ADVERTENCIA", motivo: "El corte Curvy no calza en cuerpo Petite sin advertencia: posible holgura.",
  },
  {
    id: "fit-5", nombre: "Camper 1990 → Garaje Dreamhouse 2020",
    origen: "Magical Motorhome Camper (1990)", destino: "Garaje Dreamhouse 2020",
    resultado: "INCOMPATIBLE", motivo: "El garaje de la Casa 2020 no admite el Camper de 1990 por dimensiones.",
  },
  {
    id: "fit-6", nombre: "Convertible 2020 → Garaje Dreamhouse 2020",
    origen: "Convertible Rosa 2020", destino: "Garaje Dreamhouse 2020",
    resultado: "COMPATIBLE", motivo: "Vehículo de la misma generación. Encaja en el garaje.",
  },
  {
    id: "fit-7", nombre: "Cocina interactiva → Dreamhouse 2020",
    origen: "Set Cocina Interactiva (baterías)", destino: "Dreamhouse 2020",
    resultado: "COMPATIBLE", motivo: "Mobiliario interactivo con compartimento de baterías compatible.",
  },
];

export const dreamhouses: Dreamhouse[] = [
  {
    id: "dh-2020", nombre: "Dreamhouse 2020", anio: 2020,
    vehiculosCompatibles: ["Convertible Rosa 2020"],
    ambientes: [
      { id: "amb-cocina", nombre: "Cocina", mobiliario: [
        { id: "mob-1", nombre: "Isla de cocina", usaBaterias: false },
        { id: "mob-2", nombre: "Horno con luz", usaBaterias: true },
      ]},
      { id: "amb-dorm", nombre: "Dormitorio", mobiliario: [
        { id: "mob-3", nombre: "Cama litera", usaBaterias: false },
      ]},
      { id: "amb-piscina", nombre: "Piscina", mobiliario: [
        { id: "mob-4", nombre: "Tobogán con luces", usaBaterias: true },
      ]},
    ],
  },
  {
    id: "dh-1990", nombre: "Magical Mansion 1990", anio: 1990,
    vehiculosCompatibles: ["Magical Motorhome Camper"],
    ambientes: [
      { id: "amb-salon", nombre: "Salón", mobiliario: [
        { id: "mob-5", nombre: "Sofá clásico", usaBaterias: false },
      ]},
      { id: "amb-garaje", nombre: "Garaje", mobiliario: [
        { id: "mob-6", nombre: "Elevador manual", usaBaterias: false },
      ]},
    ],
  },
];

export const packs: Pack[] = [
  {
    id: "pack-1", sku: "PACK-DREAM-DATE", nombre: "Pack Cita de Ensueño",
    precioUsd: 39.99, productosIds: ["prod-3", "prod-9", "prod-14"],
    descripcion: "Superstar Barbie + Baywatch Ken + Convertible Rosa bajo un único SKU.",
  },
  {
    id: "pack-2", sku: "PACK-FAMILIA", nombre: "Pack Familia Roberts",
    precioUsd: 44.99, productosIds: ["prod-5", "prod-19", "prod-7"],
    descripcion: "Trío de hermanas Fashionistas (Curvy + Petite + Tall).",
  },
  {
    id: "pack-3", sku: "PACK-COLECCION-VINTAGE", nombre: "Pack Colección Vintage",
    precioUsd: 320.0, productosIds: ["prod-1", "prod-2", "prod-18"],
    descripcion: "Tres clásicos de las eras Vintage y Mod para coleccionistas.",
  },
];
