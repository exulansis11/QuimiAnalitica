/**
 * Estado persistente (localStorage): tentativas, provas, estudo, preferências e questões importadas.
 * Tudo fica no navegador do usuário; exportação/backup em JSON/CSV pela página "Dados".
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { LevelId } from "../data/curriculum";
import type { FixedQuestion } from "../data/questions/types";
import { setCustomQuestions } from "../data/questions";

export interface Attempt {
  ref: string;
  topic: string;
  level: LevelId;
  difficulty: number;
  correct: boolean;
  ms: number;
  ts: number;
  mode: "pratica" | "prova";
  examId?: string;
  given?: string;
}

export interface ExamResult {
  id: string;
  presetId: string;
  title: string;
  startedAt: number;
  finishedAt: number;
  refs: string[];
  answers: (string | null)[];
  correct: boolean[];
  grade: number; // 0–10
  timeLimitMin: number;
}

export interface ActiveExam {
  id: string;
  presetId: string;
  title: string;
  refs: string[];
  answers: (string | null)[];
  flagged: boolean[];
  startedAt: number;
  timeLimitMin: number;
  current: number;
}

interface State {
  attempts: Attempt[];
  exams: ExamResult[];
  activeExam: ActiveExam | null;
  visited: Record<string, number>;
  studied: Record<string, boolean>;
  studySeconds: Record<string, number>; // "AAAA-MM-DD" → segundos
  customQuestions: FixedQuestion[];
  theme: "light" | "dark" | "system";
  name: string;
  addAttempt: (a: Attempt) => void;
  saveExam: (e: ExamResult) => void;
  setActiveExam: (e: ActiveExam | null) => void;
  patchActiveExam: (p: Partial<ActiveExam>) => void;
  visit: (topic: string) => void;
  toggleStudied: (topic: string) => void;
  tick: (seconds: number) => void;
  setTheme: (t: State["theme"]) => void;
  setName: (n: string) => void;
  addCustom: (qs: FixedQuestion[]) => void;
  removeCustom: (id: string) => void;
  importBackup: (data: Partial<State>) => void;
  reset: () => void;
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const initial = {
  attempts: [] as Attempt[],
  exams: [] as ExamResult[],
  activeExam: null as ActiveExam | null,
  visited: {} as Record<string, number>,
  studied: {} as Record<string, boolean>,
  studySeconds: {} as Record<string, number>,
  customQuestions: [] as FixedQuestion[],
  theme: "system" as const,
  name: "",
};

export const useProgress = create<State>()(
  persist(
    (set) => ({
      ...initial,
      addAttempt: (a) => set((s) => ({ attempts: [...s.attempts, a].slice(-5000) })),
      saveExam: (e) => set((s) => ({ exams: [...s.exams, e], activeExam: null })),
      setActiveExam: (e) => set({ activeExam: e }),
      patchActiveExam: (p) => set((s) => (s.activeExam ? { activeExam: { ...s.activeExam, ...p } } : {})),
      visit: (topic) => set((s) => ({ visited: { ...s.visited, [topic]: Date.now() } })),
      toggleStudied: (topic) => set((s) => ({ studied: { ...s.studied, [topic]: !s.studied[topic] } })),
      tick: (sec) => set((s) => ({ studySeconds: { ...s.studySeconds, [today()]: (s.studySeconds[today()] ?? 0) + sec } })),
      setTheme: (theme) => set({ theme }),
      setName: (name) => set({ name }),
      addCustom: (qs) =>
        set((s) => {
          const ids = new Set(s.customQuestions.map((q) => q.id));
          const merged = [...s.customQuestions, ...qs.filter((q) => !ids.has(q.id))];
          setCustomQuestions(merged);
          return { customQuestions: merged };
        }),
      removeCustom: (id) =>
        set((s) => {
          const left = s.customQuestions.filter((q) => q.id !== id);
          setCustomQuestions(left);
          return { customQuestions: left };
        }),
      importBackup: (data) =>
        set(() => {
          const next = { ...initial, ...data };
          setCustomQuestions(next.customQuestions ?? []);
          return next;
        }),
      reset: () => {
        setCustomQuestions([]);
        set({ ...initial });
      },
    }),
    {
      name: "quimianalitica-v2",
      storage: createJSONStorage(() => {
        try {
          localStorage.setItem("__t", "1");
          localStorage.removeItem("__t");
          return localStorage;
        } catch {
          const mem = new Map<string, string>();
          return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
        }
      }),
      onRehydrateStorage: () => (state) => {
        if (state) setCustomQuestions(state.customQuestions ?? []);
      },
    }
  )
);

/* ------------------------------ Métricas derivadas ------------------------------ */

export function topicStats(attempts: Attempt[]) {
  const map = new Map<string, { n: number; ok: number; ms: number; last: number }>();
  for (const a of attempts) {
    const m = map.get(a.topic) ?? { n: 0, ok: 0, ms: 0, last: 0 };
    m.n++;
    if (a.correct) m.ok++;
    m.ms += a.ms;
    m.last = Math.max(m.last, a.ts);
    map.set(a.topic, m);
  }
  return map;
}

/** Domínio 0–100 com média móvel exponencial (respostas recentes pesam mais). */
export function mastery(attempts: Attempt[], topic: string) {
  const xs = attempts.filter((a) => a.topic === topic);
  if (!xs.length) return null;
  let m = 0.5;
  for (const a of xs) m = 0.75 * m + 0.25 * (a.correct ? 1 : 0);
  const conf = Math.min(1, xs.length / 8);
  return Math.round(100 * (0.5 * (1 - conf) + m * conf));
}

export function streakDays(studySeconds: Record<string, number>, attempts: Attempt[]) {
  const days = new Set([...Object.keys(studySeconds).filter((k) => studySeconds[k] > 60), ...attempts.map((a) => dayKey(a.ts))]);
  let n = 0;
  const d = new Date();
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d.getTime()))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
