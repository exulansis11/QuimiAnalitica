import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, CheckCircle2, Play, RotateCcw, XCircle } from "lucide-react";
import { LEVELS, TOPICS, type LevelId } from "../data/curriculum";
import { drawQuestions, instantiate, poolSize, topicTitle, type Pool } from "../data/questions";
import type { Difficulty } from "../data/questions/types";
import { mastery, useProgress } from "../store/progress";
import { Badge, Button, Callout, Card, PageHeader, Progress, Stat, cx } from "../components/ui";
import { QuestionCard, levelTone } from "../components/QuestionCard";

function Chip({ on, onClick, children, color }: { on: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={cx("rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors", on ? "border-transparent text-white" : "border-line text-muted hover:text-ink")}
      style={on ? { background: color ?? "var(--brand)" } : undefined}
    >
      {children}
    </button>
  );
}

export default function Practice() {
  const { attempts, addAttempt } = useProgress();
  const [levels, setLevels] = useState<LevelId[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [diffs, setDiffs] = useState<Difficulty[]>([]);
  const [include, setInclude] = useState<("gen" | "fix" | "cus")[]>(["gen", "fix", "cus"]);
  const [count, setCount] = useState(10);
  const [session, setSession] = useState<{ refs: string[]; i: number; results: { topic: string; ok: boolean }[] } | null>(null);
  const [answered, setAnswered] = useState(false);

  const pool: Pool = { levels, topics, difficulties: diffs, include };
  const size = poolSize(pool);
  const visibleTopics = levels.length ? TOPICS.filter((t) => levels.includes(t.level)) : TOPICS;

  const toggle = <T,>(arr: T[], v: T, set: (x: T[]) => void) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const start = (p: Pool = pool) => {
    const refs = drawQuestions(p, count);
    if (!refs.length) return;
    setSession({ refs, i: 0, results: [] });
    setAnswered(false);
  };

  const weakTopics = useMemo(
    () =>
      TOPICS.map((t) => ({ id: t.id, m: mastery(attempts, t.id) }))
        .filter((x) => x.m !== null && x.m < 70)
        .sort((a, b) => a.m! - b.m!)
        .slice(0, 5)
        .map((x) => x.id),
    [attempts]
  );

  const q = session ? instantiate(session.refs[session.i]) : null;

  if (session && session.i >= session.refs.length) {
    const ok = session.results.filter((r) => r.ok).length;
    const byTopic = new Map<string, { n: number; ok: number }>();
    session.results.forEach((r) => {
      const m = byTopic.get(r.topic) ?? { n: 0, ok: 0 };
      m.n++;
      if (r.ok) m.ok++;
      byTopic.set(r.topic, m);
    });
    const pct = Math.round((100 * ok) / session.results.length);
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <PageHeader kicker="Treino concluído" title={`${ok} de ${session.results.length} corretas`} />
        <Card>
          <div className="flex flex-col items-center py-4">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className={cx("text-6xl font-bold", pct >= 70 ? "text-ok" : pct >= 50 ? "text-warn" : "text-bad")}>
              {pct}%
            </motion.div>
            <p className="mt-2 text-muted">{pct >= 85 ? "Excelente domínio!" : pct >= 70 ? "Bom trabalho — revise os erros." : pct >= 50 ? "No caminho certo. Revise a teoria dos tópicos abaixo." : "Volte à teoria e use as calculadoras passo a passo."}</p>
          </div>
          <div className="space-y-2">
            {[...byTopic.entries()].map(([t, m]) => (
              <div key={t} className="flex items-center gap-3">
                <div className="w-56 truncate text-sm">{topicTitle(t)}</div>
                <Progress value={(100 * m.ok) / m.n} className="flex-1" tone={m.ok / m.n >= 0.7 ? "ok" : "brand"} />
                <div className="num w-12 text-right text-sm">{m.ok}/{m.n}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" onClick={() => start()}><RotateCcw className="size-4" /> Novo treino igual</Button>
            <Button onClick={() => setSession(null)}>Alterar configuração</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (session && q) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-muted">Questão {session.i + 1} de {session.refs.length}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 text-ok"><CheckCircle2 className="size-4" />{session.results.filter((r) => r.ok).length}</span>
            <span className="inline-flex items-center gap-1 text-bad"><XCircle className="size-4" />{session.results.filter((r) => !r.ok).length}</span>
            <Button size="sm" variant="ghost" onClick={() => setSession(null)}>Sair</Button>
          </div>
        </div>
        <Progress value={(100 * session.i) / session.refs.length} />
        <Card>
          <QuestionCard
            key={q.id}
            q={q}
            onResult={(ok, given, ms) => {
              setAnswered(true);
              setSession((s) => (s ? { ...s, results: [...s.results, { topic: q.topic, ok }] } : s));
              addAttempt({ ref: q.id, topic: q.topic, level: q.level, difficulty: q.difficulty, correct: ok, ms, ts: Date.now(), mode: "pratica", given });
            }}
          />
          {answered && (
            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={() => { setSession((s) => (s ? { ...s, i: s.i + 1 } : s)); setAnswered(false); }}>
                {session.i + 1 < session.refs.length ? "Próxima" : "Ver resultado"} <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader kicker="Prática" title="Praticar questões" subtitle="Monte seu treino. Questões numéricas são geradas com valores novos a cada vez e trazem resolução passo a passo; as conceituais seguem o estilo de provas de graduação." />
      {weakTopics.length > 0 && (
        <Callout kind="tip" title="Treino focado nos seus pontos fracos">
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {weakTopics.map((t) => <Badge key={t}>{topicTitle(t)}</Badge>)}
            <Button size="sm" variant="primary" className="ml-auto" onClick={() => start({ topics: weakTopics })}><Brain className="size-4" /> Treinar agora</Button>
          </div>
        </Callout>
      )}
      <Card title="Níveis">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => <Chip key={l.id} on={levels.includes(l.id)} color={levelTone(l.id)} onClick={() => { toggle(levels, l.id, setLevels); setTopics([]); }}>{l.id} · {l.short}</Chip>)}
        </div>
      </Card>
      <Card title="Tópicos" subtitle={topics.length ? `${topics.length} selecionado(s)` : "Nenhum selecionado = todos os tópicos dos níveis escolhidos"}>
        <div className="flex flex-wrap gap-2">
          {visibleTopics.map((t) => <Chip key={t.id} on={topics.includes(t.id)} color={levelTone(t.level)} onClick={() => toggle(topics, t.id, setTopics)}>{t.title}</Chip>)}
        </div>
      </Card>
      <div className="grid gap-5 md:grid-cols-3">
        <Card title="Dificuldade">
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3] as Difficulty[]).map((d) => <Chip key={d} on={diffs.includes(d)} onClick={() => toggle(diffs, d, setDiffs)}>{["", "Fácil", "Médio", "Difícil"][d]}</Chip>)}
          </div>
        </Card>
        <Card title="Tipos">
          <div className="flex flex-wrap gap-2">
            <Chip on={include.includes("gen")} onClick={() => toggle(include, "gen", setInclude)}>Numéricas</Chip>
            <Chip on={include.includes("fix")} onClick={() => toggle(include, "fix", setInclude)}>Conceituais</Chip>
            <Chip on={include.includes("cus")} onClick={() => toggle(include, "cus", setInclude)}>Importadas</Chip>
          </div>
        </Card>
        <Card title="Quantidade">
          <div className="flex flex-wrap gap-2">
            {[5, 10, 20, 30].map((n) => <Chip key={n} on={count === n} onClick={() => setCount(n)}>{n}</Chip>)}
          </div>
        </Card>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" size="lg" disabled={!size} onClick={() => start()}><Play className="size-4" /> Começar treino</Button>
        <Stat label="Modelos disponíveis" value={size} sub="numéricas geram infinitas variações" />
      </div>
    </div>
  );
}
