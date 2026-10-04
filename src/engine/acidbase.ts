/**
 * Equilíbrio ácido-base EXATO pelo balanço de carga.
 *
 * Todo sistema fraco é descrito pela forma totalmente protonada HₙA^z e seus pKa.
 *  - ácido acético: pKa=[4.76], z=0
 *  - amônia/amônio: pKa=[9.24], z=+1 (adicionar NH₃ = adicionar o sistema sem contraíon)
 *  - ácido fosfórico: pKa=[2.15, 7.20, 12.35], z=0
 * Contraíons fortes (Na⁺, Cl⁻) entram como "cátions" e "ânions" no balanço de carga.
 * O pH é obtido por bisseção — vale para qualquer mistura (tampões, polipróticos, titulações).
 */
import { bisect, log10, linspace } from "./math";

export const KW = 1.0e-14;

export interface WeakSystem {
  name: string;
  pKa: number[];
  /** carga da forma totalmente protonada */
  z: number;
  /** concentração analítica total (mol/L) */
  C: number;
}

export interface Solution {
  weak: WeakSystem[];
  /** concentração de cátions de base forte (Na⁺, K⁺) */
  cations: number;
  /** concentração de ânions de ácido forte (Cl⁻, NO₃⁻) */
  anions: number;
}

/** Frações αⱼ (j = nº de prótons perdidos) para um sistema poliprótico a dado [H⁺]. */
export function alphas(pKa: number[], H: number): number[] {
  const n = pKa.length;
  const terms: number[] = [];
  let prodK = 1;
  for (let j = 0; j <= n; j++) {
    if (j > 0) prodK *= Math.pow(10, -pKa[j - 1]);
    terms.push(Math.pow(H, n - j) * prodK);
  }
  const D = terms.reduce((a, b) => a + b, 0);
  return terms.map((t) => t / D);
}

/** Carga média por molécula do sistema fraco. */
function meanCharge(sys: WeakSystem, H: number): number {
  const a = alphas(sys.pKa, H);
  return a.reduce((s, aj, j) => s + aj * (sys.z - j), 0);
}

/** Resíduo do balanço de carga (positivo = excesso de cargas +). */
export function chargeBalance(sol: Solution, pH: number): number {
  const H = Math.pow(10, -pH);
  const OH = KW / H;
  let q = H - OH + sol.cations - sol.anions;
  for (const s of sol.weak) q += s.C * meanCharge(s, H);
  return q;
}

/** pH exato da solução. */
export function solvePH(sol: Solution): number {
  // chargeBalance decresce com o pH → bisseção em [-2, 16]
  return bisect((pH) => chargeBalance(sol, pH), -2, 16, 1e-10);
}

/* ------------------------------------------------------------------ */
/* Biblioteca de ácidos/bases (25 °C, valores de Harris/Skoog)         */
/* ------------------------------------------------------------------ */

export interface AcidBaseEntry {
  id: string;
  name: string;
  formula: string;
  pKa: number[];
  z: number;
  kind: "ácido" | "base";
}

export const WEAK_LIBRARY: AcidBaseEntry[] = [
  { id: "acetic", name: "Ácido acético", formula: "CH₃COOH", pKa: [4.756], z: 0, kind: "ácido" },
  { id: "formic", name: "Ácido fórmico", formula: "HCOOH", pKa: [3.745], z: 0, kind: "ácido" },
  { id: "benzoic", name: "Ácido benzoico", formula: "C₆H₅COOH", pKa: [4.202], z: 0, kind: "ácido" },
  { id: "lactic", name: "Ácido lático", formula: "C₃H₆O₃", pKa: [3.86], z: 0, kind: "ácido" },
  { id: "hf", name: "Ácido fluorídrico", formula: "HF", pKa: [3.17], z: 0, kind: "ácido" },
  { id: "hcn", name: "Ácido cianídrico", formula: "HCN", pKa: [9.21], z: 0, kind: "ácido" },
  { id: "hocl", name: "Ácido hipocloroso", formula: "HOCl", pKa: [7.53], z: 0, kind: "ácido" },
  { id: "boric", name: "Ácido bórico", formula: "H₃BO₃", pKa: [9.237], z: 0, kind: "ácido" },
  { id: "phosphoric", name: "Ácido fosfórico", formula: "H₃PO₄", pKa: [2.148, 7.198, 12.375], z: 0, kind: "ácido" },
  { id: "carbonic", name: "Ácido carbônico", formula: "H₂CO₃", pKa: [6.351, 10.329], z: 0, kind: "ácido" },
  { id: "oxalic", name: "Ácido oxálico", formula: "H₂C₂O₄", pKa: [1.25, 4.27], z: 0, kind: "ácido" },
  { id: "citric", name: "Ácido cítrico", formula: "H₃C₆H₅O₇", pKa: [3.128, 4.761, 6.396], z: 0, kind: "ácido" },
  { id: "phthalic", name: "Ácido ftálico (biftalato)", formula: "H₂C₈H₄O₄", pKa: [2.95, 5.408], z: 0, kind: "ácido" },
  { id: "ascorbic", name: "Ácido ascórbico", formula: "H₂C₆H₆O₆", pKa: [4.1, 11.79], z: 0, kind: "ácido" },
  { id: "maleic", name: "Ácido maleico", formula: "H₂C₄H₂O₄", pKa: [1.92, 6.27], z: 0, kind: "ácido" },
  { id: "h2s", name: "Sulfeto de hidrogênio", formula: "H₂S", pKa: [7.02, 14.0], z: 0, kind: "ácido" },
  { id: "glycine", name: "Glicina (H₂Gly⁺)", formula: "H₃N⁺CH₂COOH", pKa: [2.35, 9.78], z: 1, kind: "ácido" },
  { id: "ammonia", name: "Amônia", formula: "NH₃", pKa: [9.245], z: 1, kind: "base" },
  { id: "methylamine", name: "Metilamina", formula: "CH₃NH₂", pKa: [10.645], z: 1, kind: "base" },
  { id: "pyridine", name: "Piridina", formula: "C₅H₅N", pKa: [5.2], z: 1, kind: "base" },
  { id: "tris", name: "TRIS", formula: "(HOCH₂)₃CNH₂", pKa: [8.072], z: 1, kind: "base" },
  { id: "aniline", name: "Anilina", formula: "C₆H₅NH₂", pKa: [4.6], z: 1, kind: "base" },
  { id: "ethylenediamine", name: "Etilenodiamina", formula: "H₂NCH₂CH₂NH₂", pKa: [6.848, 9.928], z: 2, kind: "base" },
];

export const getWeak = (id: string) => WEAK_LIBRARY.find((w) => w.id === id)!;

/* ------------------------------------------------------------------ */
/* Titulações                                                          */
/* ------------------------------------------------------------------ */

export type Species =
  | { type: "strong-acid"; C: number }
  | { type: "strong-base"; C: number }
  | { type: "weak"; entry: AcidBaseEntry; C: number };

export interface TitrationSetup {
  analyte: Species;
  Va: number; // mL
  titrant: Species;
  Vmax: number; // mL
  points?: number;
}

export interface CurvePoint {
  V: number;
  pH: number;
  dpH?: number;
}

/** Monta a solução resultante de misturar analito + titulante. */
export function mixSolution(a: Species, Va: number, t: Species, Vt: number): Solution {
  const Vtot = Va + Vt;
  const sol: Solution = { weak: [], cations: 0, anions: 0 };
  const add = (s: Species, V: number) => {
    const c = (s.C * V) / Vtot;
    if (s.type === "strong-acid") sol.anions += c;
    else if (s.type === "strong-base") sol.cations += c;
    else sol.weak.push({ name: s.entry.name, pKa: s.entry.pKa, z: s.entry.z, C: c });
  };
  add(a, Va);
  if (Vt > 0) add(t, Vt);
  return sol;
}

/** Número de prótons tituláveis "à vista" por mol (para volumes de equivalência). */
function protons(s: Species): number {
  if (s.type === "strong-acid" || s.type === "strong-base") return 1;
  return s.entry.kind === "ácido" ? s.entry.pKa.length : s.entry.z;
}

/** Volumes de equivalência (mL) para a titulação. */
export function equivalenceVolumes(setup: TitrationSetup): number[] {
  const n = protons(setup.analyte);
  const v1 = (setup.analyte.C * setup.Va) / setup.titrant.C;
  return Array.from({ length: n }, (_, i) => v1 * (i + 1));
}

export function titrationCurve(setup: TitrationSetup): CurvePoint[] {
  const N = setup.points ?? 301;
  const eqs = equivalenceVolumes(setup);
  const base = linspace(0, setup.Vmax, N);
  // refina perto dos pontos de equivalência para capturar o salto
  const extra = eqs.flatMap((v) => linspace(Math.max(0, v - 0.6), Math.min(setup.Vmax, v + 0.6), 41));
  const vols = [...new Set([...base, ...extra].map((v) => +v.toFixed(5)))].sort((a, b) => a - b);
  const pts: CurvePoint[] = vols.map((V) => ({ V, pH: solvePH(mixSolution(setup.analyte, setup.Va, setup.titrant, V)) }));
  for (let i = 1; i < pts.length - 1; i++) {
    pts[i].dpH = (pts[i + 1].pH - pts[i - 1].pH) / (pts[i + 1].V - pts[i - 1].V);
  }
  return pts;
}

export const pHAt = (setup: TitrationSetup, V: number) => solvePH(mixSolution(setup.analyte, setup.Va, setup.titrant, V));

/* ------------------------------------------------------------------ */
/* Indicadores                                                         */
/* ------------------------------------------------------------------ */

export interface Indicator {
  name: string;
  range: [number, number];
  acid: string; // cor em hex
  base: string;
}

export const INDICATORS: Indicator[] = [
  { name: "Alaranjado de metila", range: [3.1, 4.4], acid: "#e0453a", base: "#f2c230" },
  { name: "Verde de bromocresol", range: [3.8, 5.4], acid: "#e8d23a", base: "#2f7fd6" },
  { name: "Vermelho de metila", range: [4.4, 6.2], acid: "#d8343f", base: "#f0cf35" },
  { name: "Azul de bromotimol", range: [6.0, 7.6], acid: "#e6d23c", base: "#2357c9" },
  { name: "Vermelho de fenol", range: [6.8, 8.4], acid: "#f0c93a", base: "#d8344f" },
  { name: "Fenolftaleína", range: [8.2, 10.0], acid: "#ffffff00", base: "#e0399a" },
  { name: "Timolftaleína", range: [9.3, 10.5], acid: "#ffffff00", base: "#2f62d6" },
];

/** Cor da solução com indicador (interpolação na faixa de viragem). */
export function indicatorColor(ind: Indicator, pH: number): { color: string; frac: number } {
  const [a, b] = ind.range;
  const frac = Math.min(1, Math.max(0, (pH - a) / (b - a)));
  return { color: mixHex(ind.acid, ind.base, frac), frac };
}

function hexToRgba(h: string): [number, number, number, number] {
  const s = h.replace("#", "");
  const r = parseInt(s.slice(0, 2), 16), g = parseInt(s.slice(2, 4), 16), b = parseInt(s.slice(4, 6), 16);
  const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1;
  return [r, g, b, a];
}
export function mixHex(h1: string, h2: string, t: number): string {
  const c1 = hexToRgba(h1), c2 = hexToRgba(h2);
  // transparente herda a cor do outro extremo
  if (c1[3] === 0) c1.splice(0, 3, ...c2.slice(0, 3));
  if (c2[3] === 0) c2.splice(0, 3, ...c1.slice(0, 3));
  const m = c1.map((v, i) => v + (c2[i] - v) * t);
  return `rgba(${m[0] | 0}, ${m[1] | 0}, ${m[2] | 0}, ${m[3].toFixed(3)})`;
}

/* ------------------------------------------------------------------ */
/* Cálculos "de prova" (aproximações clássicas) para o passo a passo   */
/* ------------------------------------------------------------------ */

export const pHStrongAcid = (C: number) => -log10((C + Math.sqrt(C * C + 4 * KW)) / 2);
export const pHStrongBase = (C: number) => 14 + log10((C + Math.sqrt(C * C + 4 * KW)) / 2);
/** Ácido fraco: resolve x² + Ka x − Ka C = 0. */
export function pHWeakAcid(C: number, Ka: number) {
  const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * C)) / 2;
  return { pH: -log10(x), x, approx: -log10(Math.sqrt(Ka * C)), ionization: (100 * x) / C };
}
export function pHWeakBase(C: number, Kb: number) {
  const x = (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * C)) / 2;
  return { pH: 14 + log10(x), x, approx: 14 + log10(Math.sqrt(Kb * C)), ionization: (100 * x) / C };
}
export const hendersonHasselbalch = (pKa: number, Cbase: number, Cacid: number) => pKa + log10(Cbase / Cacid);

/** Capacidade tamponante β = 2,303(H + OH + C·Ka·H/(Ka+H)²). */
export function bufferCapacity(C: number, pKa: number, pH: number) {
  const H = 10 ** -pH, Ka = 10 ** -pKa;
  return 2.303 * (H + KW / H + (C * Ka * H) / (Ka + H) ** 2);
}
