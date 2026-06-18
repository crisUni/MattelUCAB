import type {
  MoldeRostro,
  TipoCuerpo,
  TonoPiel,
  ColorMaestro,
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

export const tonosPiel: TonoPiel[] = [
  { id: "skin-claro", nombre: "Claro", hex: "#f7d9c4" },
  { id: "skin-medio", nombre: "Medio", hex: "#e0ac90" },
  { id: "skin-bronceado", nombre: "Bronceado", hex: "#c68a63" },
  { id: "skin-oscuro", nombre: "Oscuro", hex: "#8d5524" },
  { id: "skin-fantasia", nombre: "Fantasía", hex: "#b388eb" },
];

export const coloresMaestros: ColorMaestro[] = [
  { id: "col-azul", nombre: "Azul Zafiro", hex: "#2a6ad4", zona: "Ojos" },
  { id: "col-verde", nombre: "Verde Esmeralda", hex: "#1f9e6a", zona: "Ojos" },
  { id: "col-marron", nombre: "Marrón Avellana", hex: "#7a4b1e", zona: "Ojos" },
  { id: "col-violeta", nombre: "Violeta Fantasía", hex: "#8b1a9b", zona: "Ojos" },
  { id: "col-rubio", nombre: "Rubio Platino", hex: "#e9d8a6", zona: "Cabello" },
  { id: "col-castano", nombre: "Castaño", hex: "#5a3825", zona: "Cabello" },
  { id: "col-negro", nombre: "Negro Azabache", hex: "#1c1c1c", zona: "Cabello" },
  { id: "col-rojo", nombre: "Rojo Carmesí", hex: "#c1272d", zona: "Labios" },
  { id: "col-rosa", nombre: "Rosa Malibú", hex: "#ff6fae", zona: "Vestuario" },
  { id: "col-fucsia", nombre: "Fucsia Dream", hex: "#e2237c", zona: "Vestuario" },
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
  { id: "era-vintage", codigo: "VINTAGE", nombre: "Vintage", rango: "1959–1966", descripcion: "Los orígenes: ponytail, swirl y bubblecut." },
  { id: "era-mod", codigo: "MOD", nombre: "Mod Era", rango: "1967–1972", descripcion: "Twist 'N Turn, estética mod y colores vivos." },
  { id: "era-superstar", codigo: "SUPERSTAR", nombre: "Superstar Era", rango: "1977–1994", descripcion: "Glamour disco, la sonrisa Superstar y el rosa como firma." },
  { id: "era-modern", codigo: "MODERN", nombre: "Modern Era", rango: "1995–hoy", descripcion: "Articulación, diversidad y líneas de colección." },
];

export const exclusividades: Exclusividad[] = [
  { id: "exc-pink", codigo: "PINK", nombre: "Pink Label", tiradaMax: null, descripcion: "Línea masiva de distribución general." },
  { id: "exc-black", codigo: "BLACK", nombre: "Black Label", tiradaMax: 50000, descripcion: "Coleccionista, sin restricción numérica estricta." },
  { id: "exc-gold", codigo: "GOLD", nombre: "Gold Label", tiradaMax: 25000, descripcion: "Edición limitada a menos de 25.000 unidades." },
  { id: "exc-platinum", codigo: "PLATINUM", nombre: "Platinum Label", tiradaMax: 1000, descripcion: "Ultra exclusiva, menos de 1.000 unidades. Acceso a subastas." },
];

export const monedas: Moneda[] = [
  { codigo: "USD", nombre: "Dólar estadounidense", simbolo: "$", tasaPorUsd: 1 },
  { codigo: "VES", nombre: "Bolívares (BCV)", simbolo: "Bs.", tasaPorUsd: 36.5 },
  { codigo: "BBC", nombre: "BarbieCoins", simbolo: "₿B", tasaPorUsd: 8.0 },
  { codigo: "CRY", nombre: "Cripto (USDT)", simbolo: "₮", tasaPorUsd: 1.0 },
];
