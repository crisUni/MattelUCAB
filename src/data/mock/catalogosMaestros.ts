import type {
  MoldeRostro,
  TipoCuerpo,
  Color,
  Material,
  Era,
  Exclusividad,
  Moneda,
} from "../types";

export const moldesRostro: MoldeRostro[] = [
  { id: "mold-superstar", nombre: "Superstar", anioPatente: 1976, descripcion: "Sonrisa amplia con dientes visibles. El rostro más icónico de la era disco." },
  { id: "mold-mackie", nombre: "Mackie", anioPatente: 1991, descripcion: "Diseñado por Bob Mackie. Pómulos altos, mirada de pasarela." },
  { id: "mold-millie", nombre: "Millie", anioPatente: 2015, descripcion: "Rostro moderno y versátil base de la línea Fashionistas." },
  { id: "mold-steffie", nombre: "Steffie", anioPatente: 1972, descripcion: "Labios cerrados y suaves, muy usado en reediciones de colección." },
  { id: "mold-vintage", nombre: "Vintage Ponytail", anioPatente: 1959, descripcion: "El molde original de 1959, cejas arqueadas y labios rojos." },
  { id: "mold-goddess", nombre: "Goddess", anioPatente: 1999, descripcion: "Rasgos esculturales para líneas premium Black Label." },
  { id: "mold-lea", nombre: "Lea", anioPatente: 2010, descripcion: "Molde de rasgos asiáticos, parte de la línea de diversidad." },
];

export const tiposCuerpo: TipoCuerpo[] = [
  { id: "body-original", nombre: "Original", descripcion: "Proporción clásica, pie arqueado para tacones.", formaPie: "ARQUEADO", articulado: false },
  { id: "body-curvy", nombre: "Curvy", descripcion: "Silueta con curvas, introducida en 2016.", formaPie: "PLANO", articulado: false },
  { id: "body-petite", nombre: "Petite", descripcion: "Estatura reducida y complexión menuda.", formaPie: "PLANO", articulado: false },
  { id: "body-tall", nombre: "Tall", descripcion: "Mayor estatura y piernas largas.", formaPie: "PLANO", articulado: false },
  { id: "body-mtm", nombre: "Made-to-Move", descripcion: "22 puntos de articulación, pie plano deportivo.", formaPie: "PLANO", articulado: true },
];

/**
 * Catálogo único de colores (entidad `Color` del ER). La zona de aplicación NO es
 * intrínseca al color: se decide al aplicarlo a un producto (ver `Producto.colores`).
 * Los antiguos "tonos de piel" ahora son simplemente colores que se aplican en zona PIEL.
 */
export const colores: Color[] = [
  // Tonos usados típicamente en piel
  { id: "col-piel-claro", nombre: "Piel Clara", hex: "#f7d9c4" },
  { id: "col-piel-medio", nombre: "Piel Media", hex: "#e0ac90" },
  { id: "col-piel-bronceado", nombre: "Piel Bronceada", hex: "#c68a63" },
  { id: "col-piel-oscuro", nombre: "Piel Oscura", hex: "#8d5524" },
  { id: "col-piel-fantasia", nombre: "Piel Fantasía", hex: "#b388eb" },
  // Ojos / cabello / labios / vestuario
  { id: "col-azul", nombre: "Azul Zafiro", hex: "#2a6ad4" },
  { id: "col-verde", nombre: "Verde Esmeralda", hex: "#1f9e6a" },
  { id: "col-marron", nombre: "Marrón Avellana", hex: "#7a4b1e" },
  { id: "col-violeta", nombre: "Violeta Fantasía", hex: "#8b1a9b" },
  { id: "col-rubio", nombre: "Rubio Platino", hex: "#e9d8a6" },
  { id: "col-castano", nombre: "Castaño", hex: "#5a3825" },
  { id: "col-negro", nombre: "Negro Azabache", hex: "#1c1c1c" },
  { id: "col-rojo", nombre: "Rojo Carmesí", hex: "#c1272d" },
  { id: "col-rosa", nombre: "Rosa Malibú", hex: "#ff6fae" },
  { id: "col-fucsia", nombre: "Fucsia Dream", hex: "#e2237c" },
];

export const materiales: Material[] = [
  { id: "mat-abs", nombre: "Plástico ABS", tipo: "POLIMERO", unidad: "g", costoUnitarioUsd: 0.012 },
  { id: "mat-pvc", nombre: "Vinilo PVC blando", tipo: "POLIMERO", unidad: "g", costoUnitarioUsd: 0.018 },
  { id: "mat-saran", nombre: "Fibra Saran (cabello)", tipo: "TEXTIL", unidad: "g", costoUnitarioUsd: 0.09 },
  { id: "mat-satin", nombre: "Tela Satén", tipo: "TEXTIL", unidad: "cm²", costoUnitarioUsd: 0.004 },
  { id: "mat-tul", nombre: "Tul", tipo: "TEXTIL", unidad: "cm²", costoUnitarioUsd: 0.003 },
  { id: "mat-art", nombre: "Mecanismo articulación", tipo: "MECANISMO", unidad: "unidad", costoUnitarioUsd: 0.85 },
  { id: "mat-bateria", nombre: "Compartimento batería", tipo: "MECANISMO", unidad: "unidad", costoUnitarioUsd: 1.2 },
  { id: "mat-pintura", nombre: "Pintura facial (set)", tipo: "PINTURA", unidad: "ml", costoUnitarioUsd: 0.05 },
  { id: "mat-metal", nombre: "Base metálica", tipo: "METAL", unidad: "g", costoUnitarioUsd: 0.03 },
];

export const eras: Era[] = [
  { id: "era-vintage", nombre: "Vintage", fechaInicio: 1959, fechaFin: 1966, descripcion: "Los orígenes: ponytail, swirl y bubblecut." },
  { id: "era-mod", nombre: "Mod Era", fechaInicio: 1967, fechaFin: 1972, descripcion: "Twist 'N Turn, estética mod y colores vivos." },
  { id: "era-superstar", nombre: "Superstar Era", fechaInicio: 1977, fechaFin: 1994, descripcion: "Glamour disco, la sonrisa Superstar y el rosa como firma." },
  { id: "era-modern", nombre: "Modern Era", fechaInicio: 1995, fechaFin: null, descripcion: "Articulación, diversidad y líneas de colección." },
];

export const exclusividades: Exclusividad[] = [
  { id: "exc-pink", codigo: "PINK", nombre: "Pink Label", tiradaMax: null },
  { id: "exc-black", codigo: "BLACK", nombre: "Black Label", tiradaMax: 50000 },
  { id: "exc-gold", codigo: "GOLD", nombre: "Gold Label", tiradaMax: 25000 },
  { id: "exc-platinum", codigo: "PLATINUM", nombre: "Platinum Label", tiradaMax: 1000 },
];

export const monedas: Moneda[] = [
  { codigo: "USD", nombre: "Dólar estadounidense", simbolo: "$", tasaPorUsd: 1 },
  { codigo: "VES", nombre: "Bolívares (BCV)", simbolo: "Bs.", tasaPorUsd: 36.5 },
  { codigo: "BBC", nombre: "BarbieCoins", simbolo: "₿B", tasaPorUsd: 8.0 },
  { codigo: "CRY", nombre: "Cripto (USDT)", simbolo: "₮", tasaPorUsd: 1.0 },
];
