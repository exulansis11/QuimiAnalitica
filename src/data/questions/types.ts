import type { Step } from "../../components/ui";
import type { LevelId } from "../curriculum";
import { fmt, log10, roundSig, Rng } from "../../engine/math";

export type Difficulty = 1 | 2 | 3;

export interface QBody {
  statement: string;
  kind: "num" | "mcq";
  /** numérica */
  answer?: number;
  unit?: string;
  /** tolerância relativa (padrão 2 %) */
  tol?: number;
  /** tolerância absoluta (pH, potencial) — tem prioridade */
  absTol?: number;
  /** múltipla escolha */
  options?: string[];
  correct?: number;
  steps: Step[];
  hint?: string;
  explanation?: string;
}

export interface Question extends QBody {
  id: string;
  topic: string;
  level: LevelId;
  difficulty: Difficulty;
  source: string;
  title?: string;
}

export interface Generator {
  id: string;
  topic: string;
  level: LevelId;
  difficulty: Difficulty;
  title: string;
  make: (rng: Rng) => QBody;
}

export interface FixedQuestion extends QBody {
  id: string;
  topic: string;
  level: LevelId;
  difficulty: Difficulty;
  source?: string;
}

/** Número para texto corrido (pt-BR). */
export const N = (x: number, sig = 3) => fmt(x, sig);

/** Número em TeX: 1,8 × 10⁻¹⁰ → 1{,}8\times10^{-10} */
export function T(x: number, sig = 3): string {
  if (!isFinite(x)) return "\\infty";
  if (x === 0) return "0";
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) {
    let e = Math.floor(log10(a));
    let m = roundSig(x / 10 ** e, sig);
    if (Math.abs(m) >= 10) { m /= 10; e++; }
    return `${String(m).replace(".", "{,}")}\\times10^{${e}}`;
  }
  return String(roundSig(x, sig)).replace(".", "{,}");
}

/** Valor com casas decimais fixas em TeX (pH, E). */
export const TF = (x: number, d = 2) => x.toFixed(d).replace(".", "{,}");
export const NF = (x: number, d = 2) => x.toFixed(d).replace(".", ",");

/** Embaralha opções mantendo a correta rastreada. */
export function mcq(rng: Rng, correct: string, wrong: string[]): { options: string[]; correct: number } {
  const uniq = [...new Set(wrong.filter((w) => w !== correct))];
  const all = rng.shuffle([correct, ...uniq]);
  return { options: all, correct: all.indexOf(correct) };
}

/** Confere resposta numérica. */
export function checkNumeric(q: QBody, value: number): boolean {
  if (q.answer === undefined || !isFinite(value)) return false;
  if (q.absTol !== undefined) return Math.abs(value - q.answer) <= q.absTol;
  const tol = q.tol ?? 0.02;
  if (q.answer === 0) return Math.abs(value) < 1e-9;
  return Math.abs(value - q.answer) / Math.abs(q.answer) <= tol;
}
