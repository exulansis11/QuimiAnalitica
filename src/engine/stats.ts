/**
 * Estatística analítica: descritiva, intervalos de confiança, testes de rejeição (Q, Grubbs),
 * testes t / F, propagação de incertezas, regressão linear / curva de calibração,
 * LOD/LOQ e método da adição de padrão.
 */
import { fCdf, fCrit, sum, tCrit, tPValue } from "./math";

export function describe(xs: number[]) {
  const n = xs.length;
  const mean = sum(xs) / n;
  const s = n > 1 ? Math.sqrt(sum(xs.map((x) => (x - mean) ** 2)) / (n - 1)) : NaN;
  const sorted = [...xs].sort((a, b) => a - b);
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return {
    n,
    mean,
    s,
    variance: s * s,
    rsd: (100 * s) / Math.abs(mean),
    sem: s / Math.sqrt(n),
    median,
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
  };
}

export function confidenceInterval(xs: number[], conf = 0.95) {
  const d = describe(xs);
  const t = tCrit(conf, d.n - 1);
  const half = (t * d.s) / Math.sqrt(d.n);
  return { ...d, t, half, low: d.mean - half, high: d.mean + half, conf };
}

/** Tabela de Dixon (Q crítico) — Rorabacher (1991), n = 3..10 */
export const Q_TABLE: Record<number, Record<number, number>> = {
  90: { 3: 0.941, 4: 0.765, 5: 0.642, 6: 0.56, 7: 0.507, 8: 0.468, 9: 0.437, 10: 0.412 },
  95: { 3: 0.97, 4: 0.829, 5: 0.71, 6: 0.625, 7: 0.568, 8: 0.526, 9: 0.493, 10: 0.466 },
  99: { 3: 0.994, 4: 0.926, 5: 0.821, 6: 0.74, 7: 0.68, 8: 0.634, 9: 0.598, 10: 0.568 },
};

export function qTest(xs: number[], conf: 90 | 95 | 99 = 95) {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  const range = s[n - 1] - s[0];
  const qLow = (s[1] - s[0]) / range;
  const qHigh = (s[n - 1] - s[n - 2]) / range;
  const suspect = qHigh >= qLow ? s[n - 1] : s[0];
  const Q = Math.max(qLow, qHigh);
  const Qc = Q_TABLE[conf][n];
  return { suspect, Q, Qcrit: Qc, reject: Qc !== undefined && Q > Qc, gap: qHigh >= qLow ? s[n - 1] - s[n - 2] : s[1] - s[0], range };
}

/** Teste de Grubbs (bilateral), G crítico calculado pela distribuição t. */
export function grubbs(xs: number[], alpha = 0.05) {
  const d = describe(xs);
  const suspect = Math.abs(d.max - d.mean) >= Math.abs(d.min - d.mean) ? d.max : d.min;
  const G = Math.abs(suspect - d.mean) / d.s;
  const n = d.n;
  const t = tCrit(1 - alpha / n, n - 2); // unilateral α/(2n) → bilateral 1−α/n
  const Gc = ((n - 1) / Math.sqrt(n)) * Math.sqrt((t * t) / (n - 2 + t * t));
  return { suspect, G, Gcrit: Gc, reject: G > Gc, mean: d.mean, s: d.s };
}

/** Teste t: média vs valor de referência. */
export function tTestReference(xs: number[], mu: number, conf = 0.95) {
  const d = describe(xs);
  const t = (Math.abs(d.mean - mu) * Math.sqrt(d.n)) / d.s;
  const tc = tCrit(conf, d.n - 1);
  return { ...d, t, tcrit: tc, df: d.n - 1, p: tPValue(t, d.n - 1), significant: t > tc };
}

/** Teste F (bilateral para comparar precisões: F = s²maior/s²menor). */
export function fTest(a: number[], b: number[], alpha = 0.05) {
  const da = describe(a), db = describe(b);
  const big = da.variance >= db.variance ? da : db;
  const small = big === da ? db : da;
  const F = big.variance / small.variance;
  const d1 = big.n - 1, d2 = small.n - 1;
  const Fc = fCrit(alpha / 2, d1, d2);
  const p = Math.min(1, 2 * (1 - fCdf(F, d1, d2)));
  return { F, Fcrit: Fc, d1, d2, p, significant: F > Fc };
}

/** Teste t para duas médias (agrupado se F não significativo; Welch caso contrário). */
export function tTestTwo(a: number[], b: number[], conf = 0.95) {
  const da = describe(a), db = describe(b);
  const f = fTest(a, b, 1 - conf);
  let t: number, df: number, sPooled: number | undefined;
  if (!f.significant) {
    sPooled = Math.sqrt(((da.n - 1) * da.variance + (db.n - 1) * db.variance) / (da.n + db.n - 2));
    t = (Math.abs(da.mean - db.mean) / sPooled) * Math.sqrt((da.n * db.n) / (da.n + db.n));
    df = da.n + db.n - 2;
  } else {
    const va = da.variance / da.n, vb = db.variance / db.n;
    t = Math.abs(da.mean - db.mean) / Math.sqrt(va + vb);
    df = (va + vb) ** 2 / (va ** 2 / (da.n - 1) + vb ** 2 / (db.n - 1));
  }
  const tc = tCrit(conf, df);
  return { a: da, b: db, f, method: f.significant ? "Welch" : "agrupado", sPooled, t, df, tcrit: tc, p: tPValue(t, df), significant: t > tc };
}

/** Teste t pareado. */
export function tTestPaired(a: number[], b: number[], conf = 0.95) {
  const diffs = a.map((x, i) => x - b[i]);
  const d = describe(diffs);
  const t = (Math.abs(d.mean) * Math.sqrt(d.n)) / d.s;
  const tc = tCrit(conf, d.n - 1);
  return { diffs, dMean: d.mean, sd: d.s, t, tcrit: tc, df: d.n - 1, p: tPValue(t, d.n - 1), significant: t > tc };
}

/* ======================= Propagação de incertezas ======================= */

/** y = Σ xᵢ (soma/subtração): s_y = √Σ sᵢ² */
export const propAdd = (s: number[]) => Math.sqrt(sum(s.map((v) => v * v)));
/** y = Π xᵢ^±1: (s_y/y) = √Σ (sᵢ/xᵢ)² */
export const propMul = (y: number, xs: { x: number; s: number }[]) => Math.abs(y) * Math.sqrt(sum(xs.map(({ x, s }) => (s / x) ** 2)));
/** y = log x: s_y = 0,434 s_x/x */
export const propLog = (x: number, s: number) => (0.4343 * s) / x;
/** y = 10ˣ: s_y/y = 2,303 s_x */
export const propAntilog = (y: number, s: number) => 2.303 * s * y;
/** y = xᵃ: s_y/y = a · s_x/x */
export const propPow = (x: number, s: number, a: number) => Math.abs(a) * (s / Math.abs(x)) * Math.abs(x) ** a;

/* ============================ Regressão ============================ */

export interface Regression {
  n: number;
  slope: number;
  intercept: number;
  r: number;
  r2: number;
  syx: number;
  sm: number;
  sb: number;
  xMean: number;
  yMean: number;
  Sxx: number;
  residuals: number[];
  predict: (x: number) => number;
}

export function linreg(x: number[], y: number[]): Regression {
  const n = x.length;
  const xm = sum(x) / n, ym = sum(y) / n;
  const Sxx = sum(x.map((v) => (v - xm) ** 2));
  const Syy = sum(y.map((v) => (v - ym) ** 2));
  const Sxy = sum(x.map((v, i) => (v - xm) * (y[i] - ym)));
  const slope = Sxy / Sxx;
  const intercept = ym - slope * xm;
  const residuals = y.map((v, i) => v - (slope * x[i] + intercept));
  const syx = Math.sqrt(sum(residuals.map((r) => r * r)) / (n - 2));
  const r = Sxy / Math.sqrt(Sxx * Syy);
  return {
    n, slope, intercept, r, r2: r * r, syx,
    sm: syx / Math.sqrt(Sxx),
    sb: syx * Math.sqrt(sum(x.map((v) => v * v)) / (n * Sxx)),
    xMean: xm, yMean: ym, Sxx, residuals,
    predict: (v: number) => slope * v + intercept,
  };
}

/** Concentração de desconhecida a partir da curva, com incerteza (Harris eq. 4-27). */
export function inversePredict(reg: Regression, yUnk: number, k = 1, conf = 0.95) {
  const x = (yUnk - reg.intercept) / reg.slope;
  const sx = (reg.syx / Math.abs(reg.slope)) * Math.sqrt(1 / k + 1 / reg.n + (yUnk - reg.yMean) ** 2 / (reg.slope ** 2 * reg.Sxx));
  const t = tCrit(conf, reg.n - 2);
  return { x, sx, t, half: t * sx };
}

/** LOD e LOQ (ICH): 3,3·s/m e 10·s/m, usando s_y/x ou desvio do branco. */
export const lodLoq = (s: number, m: number) => ({ lod: (3.3 * s) / Math.abs(m), loq: (10 * s) / Math.abs(m) });

/** Adição de padrão: extrapolação até y = 0 → C = b/m (na escala do eixo x). */
export function standardAddition(xAdded: number[], y: number[]) {
  const reg = linreg(xAdded, y);
  const xInt = reg.intercept / reg.slope;
  const sx = (reg.syx / Math.abs(reg.slope)) * Math.sqrt(1 / reg.n + reg.yMean ** 2 / (reg.slope ** 2 * reg.Sxx));
  return { reg, C: xInt, sC: sx };
}

/** Lê uma lista de números colada pelo usuário (vírgula decimal, ; tab ou quebra de linha). */
export function parseList(text: string): number[] {
  return text
    .split(/[\n;\t ]+/)
    .map((t) => t.trim().replace(",", "."))
    .filter((t) => t !== "")
    .map(Number)
    .filter((v) => isFinite(v));
}

/** Lê pares x,y colados (duas colunas). */
export function parsePairs(text: string): { x: number[]; y: number[] } {
  const x: number[] = [], y: number[] = [];
  for (const line of text.split(/\n/)) {
    const cells = line.trim().split(/[;\t]+|\s+|,(?=\s)/).map((c) => Number(c.replace(",", ".")));
    if (cells.length >= 2 && cells.slice(0, 2).every((v) => isFinite(v))) {
      x.push(cells[0]);
      y.push(cells[1]);
    }
  }
  return { x, y };
}
