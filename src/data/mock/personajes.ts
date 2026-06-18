import type { Personaje, Profesion } from "../types";

export const personajes: Personaje[] = [
  {
    id: "char-barbie",
    nombre: "Barbie",
    nombreCompleto: "Barbara Millicent Roberts",
    rol: "Protagonista",
    debut: 1959,
    vinculos: [
      { personajeId: "char-ken", tipo: "PAREJA" },
      { personajeId: "char-skipper", tipo: "HERMANA" },
      { personajeId: "char-stacie", tipo: "HERMANA" },
      { personajeId: "char-chelsea", tipo: "HERMANA" },
      { personajeId: "char-teresa", tipo: "AMIGA" },
      { personajeId: "char-taffy", tipo: "MASCOTA" },
    ],
  },
  {
    id: "char-ken",
    nombre: "Ken",
    nombreCompleto: "Kenneth Sean Carson",
    rol: "Pareja",
    debut: 1961,
    vinculos: [{ personajeId: "char-barbie", tipo: "PAREJA" }],
  },
  {
    id: "char-skipper",
    nombre: "Skipper",
    nombreCompleto: "Skipper Roberts",
    rol: "Hermana",
    debut: 1964,
    vinculos: [{ personajeId: "char-barbie", tipo: "HERMANA" }],
  },
  {
    id: "char-stacie",
    nombre: "Stacie",
    nombreCompleto: "Stacie Roberts",
    rol: "Hermana",
    debut: 1992,
    vinculos: [{ personajeId: "char-barbie", tipo: "HERMANA" }],
  },
  {
    id: "char-chelsea",
    nombre: "Chelsea",
    nombreCompleto: "Chelsea Roberts",
    rol: "Hermana",
    debut: 2011,
    vinculos: [{ personajeId: "char-barbie", tipo: "HERMANA" }],
  },
  {
    id: "char-teresa",
    nombre: "Teresa",
    nombreCompleto: "Teresa Rivera",
    rol: "Amiga",
    debut: 1988,
    vinculos: [{ personajeId: "char-barbie", tipo: "AMIGA" }],
  },
  {
    id: "char-taffy",
    nombre: "Taffy",
    nombreCompleto: "Taffy (perrita)",
    rol: "Mascota",
    debut: 2003,
    vinculos: [{ personajeId: "char-barbie", tipo: "MASCOTA" }],
  },
];

/** Multiverso laboral: el currículum cronológico de Barbie. */
export const profesiones: Profesion[] = [
  { id: "prof-1", personajeId: "char-barbie", titulo: "Modelo de Modas", anio: 1959, descripcion: "El debut: Teen-Age Fashion Model." },
  { id: "prof-2", personajeId: "char-barbie", titulo: "Astronauta", anio: 1965, descripcion: "Cuatro años antes del alunizaje del Apolo 11." },
  { id: "prof-3", personajeId: "char-barbie", titulo: "Cirujana", anio: 1973, descripcion: "Surgeon Barbie, en plena revolución médica." },
  { id: "prof-4", personajeId: "char-barbie", titulo: "Aerolínea — Piloto", anio: 1990, descripcion: "Capitana de vuelo comercial." },
  { id: "prof-5", personajeId: "char-barbie", titulo: "Candidata Presidencial", anio: 1992, descripcion: "Primera campaña de la línea Presidencial." },
  { id: "prof-6", personajeId: "char-barbie", titulo: "Presidenta", anio: 2000, descripcion: "Barbie for President, edición del milenio." },
  { id: "prof-7", personajeId: "char-barbie", titulo: "Ingeniera de Robótica", anio: 2018, descripcion: "Career of the Year: programación y STEM." },
  { id: "prof-8", personajeId: "char-barbie", titulo: "Científica de Datos", anio: 2024, descripcion: "Analítica e inteligencia artificial." },
  { id: "prof-9", personajeId: "char-ken", titulo: "Salvavidas", anio: 1994, descripcion: "Baywatch Ken, ícono de los noventa." },
  { id: "prof-10", personajeId: "char-ken", titulo: "Chef", anio: 2021, descripcion: "Ken culinario de la línea Dreamhouse." },
];
