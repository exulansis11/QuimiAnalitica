/**
 * Estequiometria e soluções: parser de fórmulas, massa molar, conversões de concentração.
 */
import { ELEMENTS_BY_SYMBOL } from "../data/elements";

export type Composition = Record<string, number>;

/**
 * Lê fórmulas como H2SO4, (NH4)2SO4, K4[Fe(CN)6], CuSO4·5H2O, CuSO4.5H2O, CuSO4*5H2O.
 * Lança erro com mensagem amigável se a fórmula for inválida.
 */
export function parseFormula(input: string): Composition {
  const formula = input.replace(/\s/g, "").replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080));
  if (!formula) throw new Error("Digite uma fórmula.");
  const parts = formula.split(/[·.*•]/);
  const total: Composition = {};
  for (const part of parts) {
    const m = part.match(/^(\d+)(.*)$/);
    const mult = m ? Number(m[1]) : 1;
    const body = m ? m[2] : part;
    const comp = parseGroup(body);
    for (const [el, n] of Object.entries(comp)) total[el] = (total[el] ?? 0) + n * mult;
  }
  return total;
}

function parseGroup(s: string): Composition {
  const stack: Composition[] = [{}];
  let i = 0;
  const readNum = () => {
    let j = i;
    while (j < s.length && /\d/.test(s[j])) j++;
    const n = j > i ? Number(s.slice(i, j)) : 1;
    i = j;
    return n;
  };
  while (i < s.length) {
    const ch = s[i];
    if (ch === "(" || ch === "[") {
      stack.push({});
      i++;
    } else if (ch === ")" || ch === "]") {
      i++;
      const n = readNum();
      const top = stack.pop();
      if (!top || stack.length === 0) throw new Error("Parênteses desbalanceados.");
      const dst = stack[stack.length - 1];
      for (const [el, c] of Object.entries(top)) dst[el] = (dst[el] ?? 0) + c * n;
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch;
      i++;
      while (i < s.length && /[a-z]/.test(s[i])) sym += s[i++];
      if (!ELEMENTS_BY_SYMBOL[sym]) throw new Error(`Elemento desconhecido: "${sym}".`);
      const n = readNum();
      const dst = stack[stack.length - 1];
      dst[sym] = (dst[sym] ?? 0) + n;
    } else {
      throw new Error(`Caractere inesperado: "${ch}".`);
    }
  }
  if (stack.length !== 1) throw new Error("Parênteses desbalanceados.");
  return stack[0];
}

export interface MolarMassBreakdown {
  total: number;
  rows: { symbol: string; name: string; count: number; mass: number; subtotal: number; pct: number }[];
}

export function molarMass(formula: string): MolarMassBreakdown {
  const comp = parseFormula(formula);
  const rows = Object.entries(comp).map(([symbol, count]) => {
    const el = ELEMENTS_BY_SYMBOL[symbol];
    return { symbol, name: el.name, count, mass: el.atomicMass, subtotal: el.atomicMass * count, pct: 0 };
  });
  const total = rows.reduce((s, r) => s + r.subtotal, 0);
  rows.forEach((r) => (r.pct = (100 * r.subtotal) / total));
  return { total, rows };
}

export const mm = (f: string) => molarMass(f).total;

/** Formata fórmula com subscritos Unicode. */
export function prettyFormula(f: string): string {
  return f.replace(/(\d+)/g, (m, _d, off: number) => {
    const prev = f[off - 1];
    const isCoef = off === 0 || prev === "·" || prev === "." || prev === "*";
    return isCoef ? m : m.replace(/\d/g, (d) => String.fromCharCode(0x2080 + Number(d)));
  }).replace(/[.*]/g, "·");
}

export const COMMON_COMPOUNDS: { formula: string; name: string }[] = [
  { formula: "NaCl", name: "Cloreto de sódio" },
  { formula: "NaOH", name: "Hidróxido de sódio" },
  { formula: "HCl", name: "Ácido clorídrico" },
  { formula: "H2SO4", name: "Ácido sulfúrico" },
  { formula: "HNO3", name: "Ácido nítrico" },
  { formula: "CH3COOH", name: "Ácido acético" },
  { formula: "Na2CO3", name: "Carbonato de sódio" },
  { formula: "KHC8H4O4", name: "Biftalato de potássio (padrão primário)" },
  { formula: "Na2B4O7·10H2O", name: "Bórax (padrão primário)" },
  { formula: "Na2C2O4", name: "Oxalato de sódio" },
  { formula: "KMnO4", name: "Permanganato de potássio" },
  { formula: "K2Cr2O7", name: "Dicromato de potássio" },
  { formula: "AgNO3", name: "Nitrato de prata" },
  { formula: "Na2C10H14N2O8·2H2O", name: "EDTA dissódico di-hidratado (Na₂H₂Y·2H₂O)" },
  { formula: "CaCO3", name: "Carbonato de cálcio" },
  { formula: "BaSO4", name: "Sulfato de bário" },
  { formula: "AgCl", name: "Cloreto de prata" },
  { formula: "Fe2O3", name: "Óxido de ferro(III)" },
  { formula: "Fe3O4", name: "Magnetita" },
  { formula: "Mg2P2O7", name: "Pirofosfato de magnésio" },
  { formula: "Ni(C4H7N2O2)2", name: "Dimetilglioximato de níquel" },
  { formula: "CuSO4·5H2O", name: "Sulfato de cobre penta-hidratado" },
  { formula: "(NH4)2Fe(SO4)2·6H2O", name: "Sal de Mohr" },
  { formula: "C6H8O6", name: "Ácido ascórbico (vitamina C)" },
  { formula: "C9H8O4", name: "Ácido acetilsalicílico" },
  { formula: "C8H9NO2", name: "Paracetamol" },
  { formula: "C6H12O6", name: "Glicose" },
  { formula: "KIO3", name: "Iodato de potássio" },
  { formula: "Na2S2O3·5H2O", name: "Tiossulfato de sódio penta-hidratado" },
];

/* --------------------------- Concentrações --------------------------- */

export type ConcUnit = "mol/L" | "mmol/L" | "g/L" | "mg/L" | "ppm" | "ppb" | "%m/v" | "µg/mL";

/** Converte qualquer unidade para g/L (soluções aquosas diluídas: ppm ≈ mg/L). */
export function toGperL(value: number, unit: ConcUnit, M: number): number {
  switch (unit) {
    case "mol/L": return value * M;
    case "mmol/L": return (value * M) / 1000;
    case "g/L": return value;
    case "mg/L":
    case "ppm":
    case "µg/mL": return value / 1000;
    case "ppb": return value / 1e6;
    case "%m/v": return value * 10;
  }
}
export function fromGperL(gL: number, unit: ConcUnit, M: number): number {
  switch (unit) {
    case "mol/L": return gL / M;
    case "mmol/L": return (gL / M) * 1000;
    case "g/L": return gL;
    case "mg/L":
    case "ppm":
    case "µg/mL": return gL * 1000;
    case "ppb": return gL * 1e6;
    case "%m/v": return gL / 10;
  }
}
export const CONC_UNITS: ConcUnit[] = ["mol/L", "mmol/L", "g/L", "mg/L", "ppm", "ppb", "µg/mL", "%m/v"];

/** Molaridade de reagente concentrado comercial a partir de % m/m e densidade. */
export const molarityFromPct = (pct: number, density: number, M: number) => (pct / 100) * density * 1000 / M;

export const REAGENTS = [
  { name: "HCl 37%", formula: "HCl", pct: 37, d: 1.19 },
  { name: "H2SO4 98%", formula: "H2SO4", pct: 98, d: 1.84 },
  { name: "HNO3 65%", formula: "HNO3", pct: 65, d: 1.4 },
  { name: "CH3COOH glacial 99,7%", formula: "CH3COOH", pct: 99.7, d: 1.05 },
  { name: "NH3 28%", formula: "NH3", pct: 28, d: 0.9 },
  { name: "H3PO4 85%", formula: "H3PO4", pct: 85, d: 1.69 },
];
