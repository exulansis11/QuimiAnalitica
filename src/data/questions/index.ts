/**
 * Registro do banco de questões: geradores paramétricos + conceituais + importadas pelo usuário.
 * Toda questão é referenciada por uma "ref" textual reproduzível:
 *   gen:<id>:<seed>   fix:<id>:<seed>   cus:<id>:<seed>
 * (a semente também embaralha as alternativas).
 */
import { Rng } from "../../engine/math";
import { TOPIC_BY_ID, TOPICS, type LevelId } from "../curriculum";
import { CONCEPTUAL } from "./conceptual";
import { GEN_ADV } from "./gen-adv";
import { GEN_BASIC } from "./gen-basic";
import type { Difficulty, FixedQuestion, Generator, Question } from "./types";

export const GENERATORS: Generator[] = [...GEN_BASIC, ...GEN_ADV];
const GEN_BY_ID = Object.fromEntries(GENERATORS.map((g) => [g.id, g]));

export const FIXED: FixedQuestion[] = CONCEPTUAL.map(([topic, difficulty, statement, correct, wrong, explanation], i) => ({
  id: `c${i}`,
  topic,
  level: TOPIC_BY_ID[topic]?.level ?? 0,
  difficulty,
  kind: "mcq",
  statement,
  options: [correct, ...wrong],
  correct: 0,
  explanation,
  source: "Conceitual — estilo prova de graduação",
  steps: [{ title: "Justificativa", text: explanation, result: correct }],
}));
const FIXED_BY_ID = Object.fromEntries(FIXED.map((q) => [q.id, q]));

let CUSTOM: FixedQuestion[] = [];
let CUSTOM_BY_ID: Record<string, FixedQuestion> = {};
export function setCustomQuestions(qs: FixedQuestion[]) {
  CUSTOM = qs;
  CUSTOM_BY_ID = Object.fromEntries(qs.map((q) => [q.id, q]));
}
export const getCustomQuestions = () => CUSTOM;

function shuffleOptions(q: FixedQuestion, seed: number): Pick<Question, "options" | "correct"> {
  if (!q.options) return {};
  const rng = new Rng(seed);
  const order = rng.shuffle(q.options.map((_, i) => i));
  return { options: order.map((i) => q.options![i]), correct: order.indexOf(q.correct ?? 0) };
}

export function instantiate(ref: string): Question | null {
  const [kind, id, s] = ref.split(":");
  const seed = Number(s) || 1;
  if (kind === "gen") {
    const g = GEN_BY_ID[id];
    if (!g) return null;
    try {
      const body = g.make(new Rng(seed));
      return { ...body, id: ref, topic: g.topic, level: g.level, difficulty: g.difficulty, title: g.title, source: "Gerada (valores aleatórios)" };
    } catch {
      return null;
    }
  }
  const fq = kind === "fix" ? FIXED_BY_ID[id] : kind === "cus" ? CUSTOM_BY_ID[id] : undefined;
  if (!fq) return null;
  return { ...fq, ...shuffleOptions(fq, seed), id: ref, source: fq.source ?? (kind === "cus" ? "Importada" : "Conceitual") };
}

export interface Pool {
  topics?: string[];
  levels?: LevelId[];
  difficulties?: Difficulty[];
  include?: ("gen" | "fix" | "cus")[];
}

function poolEntries(p: Pool): { kind: "gen" | "fix" | "cus"; id: string; topic: string }[] {
  const inc = p.include ?? ["gen", "fix", "cus"];
  const ok = (topic: string, level: number, diff: Difficulty) =>
    (!p.topics?.length || p.topics.includes(topic)) && (!p.levels?.length || p.levels.includes(level as LevelId)) && (!p.difficulties?.length || p.difficulties.includes(diff));
  const out: { kind: "gen" | "fix" | "cus"; id: string; topic: string }[] = [];
  if (inc.includes("gen")) GENERATORS.forEach((g) => ok(g.topic, g.level, g.difficulty) && out.push({ kind: "gen", id: g.id, topic: g.topic }));
  if (inc.includes("fix")) FIXED.forEach((q) => ok(q.topic, q.level, q.difficulty) && out.push({ kind: "fix", id: q.id, topic: q.topic }));
  if (inc.includes("cus")) CUSTOM.forEach((q) => ok(q.topic, q.level, q.difficulty) && out.push({ kind: "cus", id: q.id, topic: q.topic }));
  return out;
}

export const poolSize = (p: Pool) => poolEntries(p).length;

/**
 * Sorteia n refs equilibrando tópicos (round-robin entre tópicos embaralhados).
 * Geradores podem repetir com sementes diferentes se o pool for pequeno.
 */
export function drawQuestions(p: Pool, n: number, seed = Date.now()): string[] {
  const rng = new Rng(seed);
  const entries = poolEntries(p);
  if (!entries.length) return [];
  const byTopic = new Map<string, typeof entries>();
  rng.shuffle(entries).forEach((e) => byTopic.set(e.topic, [...(byTopic.get(e.topic) ?? []), e]));
  const topics = rng.shuffle([...byTopic.keys()]);
  const refs: string[] = [];
  const used = new Set<string>();
  let round = 0;
  while (refs.length < n && round < 50) {
    for (const t of topics) {
      if (refs.length >= n) break;
      const list = byTopic.get(t)!;
      const e = list[round % list.length];
      const key = `${e.kind}:${e.id}`;
      if (round >= list.length && e.kind !== "gen") continue; // fixas não repetem
      if (used.has(key) && e.kind !== "gen") continue;
      used.add(key);
      refs.push(`${key}:${rng.int(1, 1e9)}`);
    }
    round++;
  }
  return rng.shuffle(refs);
}

/* ------------------------------ Provas pré-montadas ------------------------------ */

export interface ExamPreset {
  id: string;
  title: string;
  description: string;
  pool: Pool;
  count: number;
  minutes: number;
  tag: string;
}

export const EXAM_PRESETS: ExamPreset[] = [
  { id: "p0", title: "Diagnóstico de Matemática", description: "Notação científica, algarismos significativos, log e unidades. Ideal para começar.", pool: { levels: [0] }, count: 10, minutes: 25, tag: "Nível 0" },
  { id: "p1", title: "P1 — Fundamentos e Soluções", description: "Mol, concentrações, diluições e cálculos volumétricos (padronização, retrotitulação).", pool: { levels: [0, 1] }, count: 12, minutes: 50, tag: "Níveis 0–1" },
  { id: "p2", title: "P2 — Estatística e Qualidade Analítica", description: "Erros, IC, testes Q/t/F, propagação e calibração.", pool: { levels: [2] }, count: 12, minutes: 60, tag: "Nível 2" },
  { id: "p3", title: "P3 — Equilíbrio Químico", description: "Atividade, pH exato, tampões, polipróticos e solubilidade.", pool: { levels: [3] }, count: 12, minutes: 60, tag: "Nível 3" },
  { id: "p4", title: "P4 — Volumetria e Gravimetria", description: "Neutralização, precipitação, complexometria, redox e gravimetria.", pool: { levels: [4] }, count: 14, minutes: 80, tag: "Nível 4" },
  { id: "p5", title: "P5 — Análise Instrumental", description: "Espectrofotometria, potenciometria e cromatografia.", pool: { levels: [5] }, count: 12, minutes: 60, tag: "Nível 5" },
  { id: "qa1", title: "Prova Final — Química Analítica I", description: "Fundamentos, estatística e equilíbrio (níveis 1–3), estilo prova final de disciplina.", pool: { levels: [1, 2, 3] }, count: 20, minutes: 120, tag: "Final" },
  { id: "qa2", title: "Prova Final — Química Analítica II", description: "Métodos clássicos e instrumentais (níveis 4–5).", pool: { levels: [4, 5] }, count: 20, minutes: 120, tag: "Final" },
  { id: "geral", title: "Simulado Geral (Concurso/Residência)", description: "Todas as áreas, questões difíceis misturadas.", pool: { difficulties: [2, 3] }, count: 25, minutes: 150, tag: "Simulado" },
];

export const topicTitle = (id: string) => TOPIC_BY_ID[id]?.title ?? id;
export const ALL_TOPIC_IDS = TOPICS.map((t) => t.id);
