/**
 * Utilidades numéricas: formatação, algarismos significativos, raízes,
 * distribuições estatísticas (t, F, normal) e gerador pseudoaleatório com semente.
 */

export const LN10 = Math.log(10);
export const log10 = (x: number) => Math.log(x) / LN10;

/** Arredonda para n algarismos significativos. */
export function roundSig(x: number, n: number): number {
  if (x === 0 || !isFinite(x)) return x;
  const d = Math.ceil(log10(Math.abs(x)));
  const p = n - d;
  const m = Math.pow(10, p);
  return Math.round(x * m) / m;
}

/** Conta algarismos significativos de um número escrito como texto (ex.: "0,00340" → 3). */
export function countSigFigs(raw: string): number {
  let s = raw.trim().replace(",", ".").replace(/^[+-]/, "");
  let exp = "";
  const e = s.search(/[eE]/);
  if (e >= 0) {
    exp = s.slice(e);
    s = s.slice(0, e);
  }
  void exp;
  if (!/^\d*\.?\d*$/.test(s) || s === "" || s === ".") return NaN;
  const hasPoint = s.includes(".");
  const digits = s.replace(".", "");
  const trimmedLeft = digits.replace(/^0+/, "");
  if (trimmedLeft === "") return hasPoint ? Math.max(1, digits.length - (s.indexOf(".") >= 0 ? 1 : 0)) : 1;
  if (hasPoint) return trimmedLeft.length;
  // sem ponto decimal: zeros à direita são ambíguos → não contam
  return trimmedLeft.replace(/0+$/, "").length || 1;
}

const SUP: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
export const sup = (s: string | number) => String(s).split("").map((c) => SUP[c] ?? c).join("");

/** Formata número em pt-BR, usando notação científica quando necessário. */
export function fmt(x: number, sig = 4): string {
  if (x === undefined || x === null || Number.isNaN(x)) return "—";
  if (!isFinite(x)) return x > 0 ? "∞" : "−∞";
  if (x === 0) return "0";
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) {
    const exp = Math.floor(log10(a));
    let mant = roundSig(x / Math.pow(10, exp), sig);
    let e2 = exp;
    if (Math.abs(mant) >= 10) {
      mant /= 10;
      e2++;
    }
    return `${mant.toLocaleString("pt-BR", { maximumSignificantDigits: sig, useGrouping: false })} × 10${sup(e2)}`;
  }
  return roundSig(x, sig).toLocaleString("pt-BR", { maximumSignificantDigits: sig, useGrouping: false });
}

/** Formata com casas decimais fixas (útil para pH, potencial). */
export const fix = (x: number, d = 2) => (isFinite(x) ? (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false }) : "—");

/** Lê número digitado aceitando vírgula e notação "1,2e-5". */
export function parseNum(s: string | number): number {
  if (typeof s === "number") return s;
  const t = s.trim().replace(/\s/g, "").replace(/×10\^?/g, "e").replace(",", ".");
  if (t === "") return NaN;
  return Number(t);
}

/** Bisseção robusta: encontra x em [a,b] com f(x)=0 (f deve trocar de sinal). */
export function bisect(f: (x: number) => number, a: number, b: number, tol = 1e-12, maxIt = 200): number {
  let fa = f(a);
  const fb = f(b);
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) return Math.abs(fa) < Math.abs(fb) ? a : b;
  for (let i = 0; i < maxIt; i++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (fm === 0 || (b - a) / 2 < tol) return m;
    if (fa * fm < 0) b = m;
    else {
      a = m;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

/** Raiz positiva de ax² + bx + c = 0 numericamente estável. */
export function quadPos(a: number, b: number, c: number): number {
  if (a === 0) return -c / b;
  const disc = Math.sqrt(Math.max(0, b * b - 4 * a * c));
  const q = -0.5 * (b + Math.sign(b || 1) * disc);
  const r1 = q / a;
  const r2 = c / q;
  const roots = [r1, r2].filter((r) => isFinite(r) && r >= 0);
  return roots.length ? Math.max(...roots.filter((r) => r >= 0)) : Math.max(r1, r2);
}

export const linspace = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
export const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/* ------------------------------------------------------------------ */
/* Distribuições                                                       */
/* ------------------------------------------------------------------ */

function gammaln(x: number): number {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  const tmp0 = x + 5.5;
  const tmp = tmp0 - (x + 0.5) * Math.log(tmp0);
  let ser = 1.000000000190015;
  for (const c of cof) ser += c / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Função beta incompleta regularizada I_x(a,b). */
export function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** CDF da t de Student. */
export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const p = 0.5 * ibeta(x, df / 2, 0.5);
  return t >= 0 ? 1 - p : p;
}

/** t crítico bilateral (ex.: conf=0.95 → t tal que P(|T|<t)=0.95). */
export function tCrit(conf: number, df: number): number {
  const target = 1 - (1 - conf) / 2;
  return bisect((t) => tCdf(t, df) - target, 0, 1000, 1e-10);
}

/** p-valor bilateral para t. */
export const tPValue = (t: number, df: number) => 2 * (1 - tCdf(Math.abs(t), df));

/** CDF da distribuição F. */
export function fCdf(f: number, d1: number, d2: number): number {
  if (f <= 0) return 0;
  return ibeta((d1 * f) / (d1 * f + d2), d1 / 2, d2 / 2);
}

/** F crítico unilateral (cauda superior), ex.: alpha=0.05. */
export function fCrit(alpha: number, d1: number, d2: number): number {
  return bisect((f) => fCdf(f, d1, d2) - (1 - alpha), 0, 1e5, 1e-10);
}

/** CDF normal padrão (Abramowitz-Stegun 7.1.26, erro < 1.5e-7). */
export function normCdf(z: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}
export const normPdf = (z: number) => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);

/* ------------------------------------------------------------------ */
/* Aleatoriedade reproduzível (para questões paramétricas)             */
/* ------------------------------------------------------------------ */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  private r: () => number;
  constructor(seed: number) {
    this.r = mulberry32(seed);
  }
  next() {
    return this.r();
  }
  /** número em [a,b] arredondado para `sig` algarismos significativos */
  num(a: number, b: number, sig = 3) {
    return roundSig(a + (b - a) * this.r(), sig);
  }
  int(a: number, b: number) {
    return Math.floor(a + (b - a + 1) * this.r());
  }
  pick<T>(xs: readonly T[]): T {
    return xs[Math.floor(this.r() * xs.length)];
  }
  shuffle<T>(xs: T[]): T[] {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
