/**
 * Métodos instrumentais: espectrofotometria (Beer-Lambert), cromatografia e potenciometria.
 */
import { linspace, log10 } from "./math";

/* ============================ ESPECTROFOTOMETRIA ============================ */

export const absorbance = (eps: number, b: number, c: number) => eps * b * c;
export const transmittance = (A: number) => 10 ** -A;
export const AfromT = (T: number) => -log10(T);

/** Espectro modelo de uma espécie: soma de bandas gaussianas (λ em nm, ε em L mol⁻¹ cm⁻¹). */
export interface Band { center: number; width: number; epsMax: number }
export interface Chromophore { id: string; name: string; color: string; bands: Band[] }

export const CHROMOPHORES: Chromophore[] = [
  { id: "kmno4", name: "KMnO₄", color: "#8e2d8f", bands: [{ center: 525, width: 30, epsMax: 2400 }, { center: 545, width: 18, epsMax: 1900 }, { center: 507, width: 14, epsMax: 1600 }] },
  { id: "k2cr2o7", name: "K₂Cr₂O₇", color: "#f08a24", bands: [{ center: 350, width: 35, epsMax: 3150 }, { center: 257, width: 25, epsMax: 4300 }, { center: 440, width: 40, epsMax: 370 }] },
  { id: "cu-nh3", name: "[Cu(NH₃)₄]²⁺", color: "#2a5fd6", bands: [{ center: 610, width: 85, epsMax: 52 }] },
  { id: "fe-phen", name: "Fe(fen)₃²⁺", color: "#e0442e", bands: [{ center: 510, width: 45, epsMax: 11100 }] },
  { id: "co", name: "Co²⁺(aq)", color: "#d26aa0", bands: [{ center: 510, width: 55, epsMax: 4.8 }] },
  { id: "ni", name: "Ni²⁺(aq)", color: "#33a36b", bands: [{ center: 395, width: 40, epsMax: 5.2 }, { center: 720, width: 70, epsMax: 2.1 }] },
];

export function epsilonAt(ch: Chromophore, lambda: number) {
  return ch.bands.reduce((s, b) => s + b.epsMax * Math.exp(-((lambda - b.center) ** 2) / (2 * b.width ** 2)), 0);
}
export function spectrum(ch: Chromophore, c: number, b = 1, from = 350, to = 750, n = 201) {
  return linspace(from, to, n).map((l) => ({ lambda: l, A: epsilonAt(ch, l) * b * c }));
}
export function lambdaMax(ch: Chromophore) {
  let best = 0, bl = 400;
  for (let l = 350; l <= 750; l++) {
    const e = epsilonAt(ch, l);
    if (e > best) { best = e; bl = l; }
  }
  return { lambda: bl, eps: best };
}

/** Mistura de dois componentes (aditividade): resolve sistema 2×2 em λ₁ e λ₂. */
export function twoComponent(A1: number, A2: number, eX1: number, eY1: number, eX2: number, eY2: number, b = 1) {
  const det = b * b * (eX1 * eY2 - eY1 * eX2);
  const cX = (b * (A1 * eY2 - A2 * eY1)) / det;
  const cY = (b * (eX1 * A2 - eX2 * A1)) / det;
  return { cX, cY, det };
}

/** Cor (aproximada) de um comprimento de onda visível. */
export function wavelengthToRGB(l: number): string {
  let r = 0, g = 0, b = 0;
  if (l >= 380 && l < 440) { r = -(l - 440) / 60; b = 1; }
  else if (l < 490) { g = (l - 440) / 50; b = 1; }
  else if (l < 510) { g = 1; b = -(l - 510) / 20; }
  else if (l < 580) { r = (l - 510) / 70; g = 1; }
  else if (l < 645) { r = 1; g = -(l - 645) / 65; }
  else if (l <= 780) { r = 1; }
  const f = l < 420 ? 0.3 + (0.7 * (l - 380)) / 40 : l > 700 ? 0.3 + (0.7 * (780 - l)) / 80 : 1;
  const c = (x: number) => Math.round(255 * Math.pow(x * f, 0.8));
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}

/* ============================ CROMATOGRAFIA ============================ */

export const plates = (tR: number, w: number) => 16 * (tR / w) ** 2;
export const platesHalf = (tR: number, wHalf: number) => 5.54 * (tR / wHalf) ** 2;
export const retentionFactor = (tR: number, tM: number) => (tR - tM) / tM;
export const selectivity = (tR2: number, tR1: number, tM: number) => (tR2 - tM) / (tR1 - tM);
export const resolution = (tR1: number, tR2: number, w1: number, w2: number) => (2 * (tR2 - tR1)) / (w1 + w2);
/** Equação de Purnell: Rs = (√N/4)·((α−1)/α)·(k₂/(1+k₂)) */
export const purnell = (N: number, alpha: number, k2: number) => (Math.sqrt(N) / 4) * ((alpha - 1) / alpha) * (k2 / (1 + k2));
/** van Deemter: H = A + B/u + C·u */
export const vanDeemter = (A: number, B: number, C: number, u: number) => A + B / u + C * u;
export const uOptimum = (B: number, C: number) => Math.sqrt(B / C);

export interface Peak { name: string; tR: number; sigma: number; area: number; color: string }

export function chromatogram(peaks: Peak[], tMax: number, n = 600, noise = 0, seed = 1) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647 - 0.5);
  return linspace(0, tMax, n).map((t) => {
    const y = peaks.reduce((acc, p) => acc + (p.area / (p.sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-((t - p.tR) ** 2) / (2 * p.sigma ** 2)), 0);
    return { t, y: y + noise * rnd() };
  });
}

/* ============================ POTENCIOMETRIA ============================ */

/** Eletrodo íon-seletivo: E = K + (0,05916/z)·log a */
export const iseResponse = (K: number, z: number, a: number, slopePct = 100) => K + ((0.05916 * slopePct) / 100 / z) * log10(a);
/** Equação de Nikolsky-Eisenman: E = K + (0,05916/z) log(aᵢ + kᵢⱼ aⱼ^{zᵢ/zⱼ}) */
export const nikolsky = (K: number, zi: number, ai: number, kij: number, aj: number, zj: number) => K + (0.05916 / zi) * log10(ai + kij * aj ** (zi / zj));
