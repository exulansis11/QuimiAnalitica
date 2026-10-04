/**
 * Complexometria (EDTA), precipitação (argentometria, Ksp), oxirredução (Nernst)
 * e atividade (força iônica / Debye-Hückel).
 */
import { alphas } from "./acidbase";
import { bisect, linspace, log10, quadPos } from "./math";

/* ============================ ATIVIDADE ============================ */

/** Força iônica I = ½ Σ cᵢ zᵢ² */
export const ionicStrength = (ions: { c: number; z: number }[]) => 0.5 * ions.reduce((s, i) => s + i.c * i.z * i.z, 0);

/** Debye-Hückel estendida (α em pm, 25 °C): log γ = −0,51 z² √I / (1 + α√I/305) */
export function activityCoefficient(z: number, I: number, alphaPm = 400) {
  const sI = Math.sqrt(I);
  return Math.pow(10, (-0.51 * z * z * sI) / (1 + (alphaPm * sI) / 305));
}
/** Equação de Davies (até I≈0,5) */
export function daviesGamma(z: number, I: number) {
  const sI = Math.sqrt(I);
  return Math.pow(10, -0.51 * z * z * (sI / (1 + sI) - 0.3 * I));
}

/* ============================ COMPLEXOMETRIA ============================ */

/** pKa do EDTA (H₆Y²⁺ → Y⁴⁻), Harris 25 °C, I = 0,1 M */
export const EDTA_PKA = [0.0, 1.5, 2.0, 2.69, 6.13, 10.37];
/** α(Y⁴⁻) em função do pH */
export const alphaY4 = (pH: number) => alphas(EDTA_PKA, 10 ** -pH)[6];

export const METALS_EDTA: { ion: string; logKf: number; minPH: number }[] = [
  { ion: "Ba²⁺", logKf: 7.88, minPH: 10 },
  { ion: "Mg²⁺", logKf: 8.79, minPH: 10 },
  { ion: "Sr²⁺", logKf: 8.72, minPH: 10 },
  { ion: "Ca²⁺", logKf: 10.65, minPH: 7.5 },
  { ion: "Mn²⁺", logKf: 13.89, minPH: 5.5 },
  { ion: "Fe²⁺", logKf: 14.3, minPH: 5 },
  { ion: "Al³⁺", logKf: 16.4, minPH: 4 },
  { ion: "Co²⁺", logKf: 16.45, minPH: 4 },
  { ion: "Zn²⁺", logKf: 16.5, minPH: 4 },
  { ion: "Cd²⁺", logKf: 16.5, minPH: 4 },
  { ion: "Pb²⁺", logKf: 18.0, minPH: 3.5 },
  { ion: "Ni²⁺", logKf: 18.4, minPH: 3 },
  { ion: "Cu²⁺", logKf: 18.78, minPH: 3 },
  { ion: "Hg²⁺", logKf: 21.5, minPH: 2 },
  { ion: "Fe³⁺", logKf: 25.1, minPH: 1.5 },
];

export interface EdtaSetup {
  CM: number; // mol/L do metal
  VM: number; // mL
  CY: number; // mol/L do EDTA
  logKf: number;
  pH: number;
  /** fração do metal livre não complexada por ligante auxiliar (αM), 1 = sem ligante auxiliar */
  alphaM?: number;
  Vmax: number;
}

export function edtaConditionalK(s: EdtaSetup) {
  return 10 ** s.logKf * alphaY4(s.pH) * (s.alphaM ?? 1);
}

/** pM exato: K'[M]² + (K'(CY−CM)+1)[M] − CM = 0 */
export function edtaPM(s: EdtaSetup, V: number) {
  const Kp = edtaConditionalK(s);
  const Vt = s.VM + V;
  const cM = (s.CM * s.VM) / Vt;
  const cY = (s.CY * V) / Vt;
  const M = quadPos(Kp, Kp * (cY - cM) + 1, -cM);
  // M = metal não complexado com EDTA (M'); [Mⁿ⁺] livre = αM·M'
  return -log10(M * (s.alphaM ?? 1));
}

export function edtaCurve(s: EdtaSetup) {
  const Veq = (s.CM * s.VM) / s.CY;
  const vols = [...new Set([...linspace(0, s.Vmax, 301), ...linspace(Math.max(0, Veq - 0.5), Veq + 0.5, 41)].map((v) => +v.toFixed(5)))].sort((a, b) => a - b);
  return { Veq, points: vols.map((V) => ({ V, pM: edtaPM(s, V) })) };
}

/* ============================ PRECIPITAÇÃO ============================ */

export const KSP: { salt: string; formula: string; Ksp: number; cation: [number, number]; anion: [number, number] }[] = [
  // cation: [coef, carga], anion: [coef, carga]
  { salt: "Cloreto de prata", formula: "AgCl", Ksp: 1.8e-10, cation: [1, 1], anion: [1, -1] },
  { salt: "Brometo de prata", formula: "AgBr", Ksp: 5.0e-13, cation: [1, 1], anion: [1, -1] },
  { salt: "Iodeto de prata", formula: "AgI", Ksp: 8.3e-17, cation: [1, 1], anion: [1, -1] },
  { salt: "Tiocianato de prata", formula: "AgSCN", Ksp: 1.1e-12, cation: [1, 1], anion: [1, -1] },
  { salt: "Cromato de prata", formula: "Ag₂CrO₄", Ksp: 1.2e-12, cation: [2, 1], anion: [1, -2] },
  { salt: "Sulfato de bário", formula: "BaSO₄", Ksp: 1.1e-10, cation: [1, 2], anion: [1, -2] },
  { salt: "Oxalato de cálcio", formula: "CaC₂O₄", Ksp: 2.3e-9, cation: [1, 2], anion: [1, -2] },
  { salt: "Carbonato de cálcio", formula: "CaCO₃", Ksp: 4.5e-9, cation: [1, 2], anion: [1, -2] },
  { salt: "Fluoreto de cálcio", formula: "CaF₂", Ksp: 3.9e-11, cation: [1, 2], anion: [2, -1] },
  { salt: "Hidróxido de magnésio", formula: "Mg(OH)₂", Ksp: 7.1e-12, cation: [1, 2], anion: [2, -1] },
  { salt: "Hidróxido de ferro(III)", formula: "Fe(OH)₃", Ksp: 2.0e-39, cation: [1, 3], anion: [3, -1] },
  { salt: "Sulfato de chumbo", formula: "PbSO₄", Ksp: 1.6e-8, cation: [1, 2], anion: [1, -2] },
  { salt: "Iodeto de chumbo", formula: "PbI₂", Ksp: 7.9e-9, cation: [1, 2], anion: [2, -1] },
  { salt: "Fosfato de cálcio", formula: "Ca₃(PO₄)₂", Ksp: 2.07e-33, cation: [3, 2], anion: [2, -3] },
];

/**
 * Solubilidade molar s de MₐXᵦ com íon comum:
 * (a·s + cM)ᵃ (b·s + cX)ᵇ = Ksp
 */
export function solubility(Ksp: number, a: number, b: number, cM = 0, cX = 0) {
  const f = (ls: number) => {
    const s = 10 ** ls;
    return a * log10(a * s + cM) + b * log10(b * s + cX) - log10(Ksp);
  };
  const ls = bisect(f, -40, 2, 1e-12);
  return 10 ** ls;
}

export interface ArgSetup {
  CX: number; // haleto mol/L
  VX: number; // mL
  CAg: number; // mol/L
  Ksp: number;
  Vmax: number;
}

/** pAg e pX exatos: [Ag⁺]([Ag⁺] − d) = Ksp, d = cAg − cX */
export function argPoint(s: ArgSetup, V: number) {
  const Vt = s.VX + V;
  const cAg = (s.CAg * V) / Vt;
  const cX = (s.CX * s.VX) / Vt;
  const d = cAg - cX;
  const Ag = (d + Math.sqrt(d * d + 4 * s.Ksp)) / 2;
  const X = s.Ksp / Ag;
  return { V, pAg: -log10(Ag), pX: -log10(X) };
}
export function argCurve(s: ArgSetup) {
  const Veq = (s.CX * s.VX) / s.CAg;
  const vols = [...new Set([...linspace(0, s.Vmax, 301), ...linspace(Math.max(0, Veq - 0.5), Veq + 0.5, 41)].map((v) => +v.toFixed(5)))].sort((a, b) => a - b);
  return { Veq, points: vols.map((V) => argPoint(s, V)) };
}

/* ============================ OXIRREDUÇÃO ============================ */

export const NERNST_K = 0.05916; // V, 25 °C

/** Potencial de Nernst: E = E° − (0,05916/n) log Q */
export const nernst = (E0: number, n: number, Q: number) => E0 - (NERNST_K / n) * log10(Q);

export interface RedoxSetup {
  label: string;
  /** analito na forma reduzida (ex.: Fe²⁺) → oxidada: E°₁, n₁ */
  E1: number;
  n1: number;
  /** titulante oxidante (ex.: Ce⁴⁺) → reduzido: E°₂, n₂ */
  E2: number;
  n2: number;
  C1: number;
  V1: number;
  C2: number;
  Vmax: number;
}

/**
 * E exato pelo balanço de elétrons:
 * n₁·mol₁·f_ox,1(E) = n₂·mol₂·f_red,2(E), com frações de Nernst.
 */
export function redoxE(s: RedoxSetup, V: number) {
  if (V <= 0) return NaN;
  const m1 = s.C1 * s.V1, m2 = s.C2 * V;
  const fOx1 = (E: number) => 1 / (1 + 10 ** ((-s.n1 * (E - s.E1)) / NERNST_K));
  const fRed2 = (E: number) => 1 / (1 + 10 ** ((s.n2 * (E - s.E2)) / NERNST_K));
  return bisect((E) => s.n1 * m1 * fOx1(E) - s.n2 * m2 * fRed2(E), -1, 3, 1e-9);
}
export function redoxCurve(s: RedoxSetup) {
  const Veq = (s.n1 * s.C1 * s.V1) / (s.n2 * s.C2);
  const vols = [...new Set([...linspace(0.05, s.Vmax, 301), ...linspace(Math.max(0.05, Veq - 0.5), Veq + 0.5, 41)].map((v) => +v.toFixed(5)))].sort((a, b) => a - b);
  const Eeq = (s.n1 * s.E1 + s.n2 * s.E2) / (s.n1 + s.n2);
  return { Veq, Eeq, points: vols.map((V) => ({ V, E: redoxE(s, V) })) };
}

export const REDOX_PRESETS: Omit<RedoxSetup, "C1" | "V1" | "C2" | "Vmax">[] = [
  { label: "Fe²⁺ com Ce⁴⁺ (H₂SO₄ 1 M)", E1: 0.68, n1: 1, E2: 1.44, n2: 1 },
  { label: "Fe²⁺ com MnO₄⁻ (pH 0)", E1: 0.771, n1: 1, E2: 1.507, n2: 5 },
  { label: "Sn²⁺ com Ce⁴⁺", E1: 0.139, n1: 2, E2: 1.44, n2: 1 },
  { label: "Fe²⁺ com Cr₂O₇²⁻ (aprox., pH 0)", E1: 0.771, n1: 1, E2: 1.36, n2: 6 },
  { label: "U⁴⁺ com Ce⁴⁺", E1: 0.334, n1: 2, E2: 1.44, n2: 1 },
];

export const STANDARD_POTENTIALS: { half: string; E0: number; n: number }[] = [
  { half: "F₂ + 2e⁻ ⇌ 2F⁻", E0: 2.866, n: 2 },
  { half: "Ce⁴⁺ + e⁻ ⇌ Ce³⁺ (H₂SO₄)", E0: 1.44, n: 1 },
  { half: "MnO₄⁻ + 8H⁺ + 5e⁻ ⇌ Mn²⁺ + 4H₂O", E0: 1.507, n: 5 },
  { half: "Cl₂ + 2e⁻ ⇌ 2Cl⁻", E0: 1.36, n: 2 },
  { half: "Cr₂O₇²⁻ + 14H⁺ + 6e⁻ ⇌ 2Cr³⁺ + 7H₂O", E0: 1.36, n: 6 },
  { half: "O₂ + 4H⁺ + 4e⁻ ⇌ 2H₂O", E0: 1.229, n: 4 },
  { half: "Br₂ + 2e⁻ ⇌ 2Br⁻", E0: 1.078, n: 2 },
  { half: "Ag⁺ + e⁻ ⇌ Ag", E0: 0.799, n: 1 },
  { half: "Fe³⁺ + e⁻ ⇌ Fe²⁺", E0: 0.771, n: 1 },
  { half: "I₂ + 2e⁻ ⇌ 2I⁻", E0: 0.535, n: 2 },
  { half: "Cu²⁺ + 2e⁻ ⇌ Cu", E0: 0.339, n: 2 },
  { half: "AgCl + e⁻ ⇌ Ag + Cl⁻", E0: 0.222, n: 1 },
  { half: "Sn⁴⁺ + 2e⁻ ⇌ Sn²⁺", E0: 0.139, n: 2 },
  { half: "S₄O₆²⁻ + 2e⁻ ⇌ 2S₂O₃²⁻", E0: 0.08, n: 2 },
  { half: "2H⁺ + 2e⁻ ⇌ H₂", E0: 0.0, n: 2 },
  { half: "Pb²⁺ + 2e⁻ ⇌ Pb", E0: -0.126, n: 2 },
  { half: "Ni²⁺ + 2e⁻ ⇌ Ni", E0: -0.236, n: 2 },
  { half: "Cd²⁺ + 2e⁻ ⇌ Cd", E0: -0.402, n: 2 },
  { half: "Fe²⁺ + 2e⁻ ⇌ Fe", E0: -0.44, n: 2 },
  { half: "Zn²⁺ + 2e⁻ ⇌ Zn", E0: -0.762, n: 2 },
  { half: "Al³⁺ + 3e⁻ ⇌ Al", E0: -1.677, n: 3 },
  { half: "Mg²⁺ + 2e⁻ ⇌ Mg", E0: -2.36, n: 2 },
  { half: "Na⁺ + e⁻ ⇌ Na", E0: -2.713, n: 1 },
  { half: "Li⁺ + e⁻ ⇌ Li", E0: -3.04, n: 1 },
];

/** Constante de equilíbrio a partir de E°cel: log K = nE°/0,05916 */
export const logKfromE = (n: number, Ecell: number) => (n * Ecell) / NERNST_K;
/** ΔG° = −nFE° (kJ/mol) */
export const deltaG = (n: number, E: number) => (-n * 96485 * E) / 1000;
