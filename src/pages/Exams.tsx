import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Flag, Play, Printer, Settings2, Trophy, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LEVELS, type LevelId } from "../data/curriculum";
import { drawQuestions, EXAM_PRESETS, instantiate, poolSize, topicTitle, type ExamPreset } from "../data/questions";
import { useProgress, type ExamResult } from "../store/progress";
import { Badge, Button, Callout, Card, Empty, PageHeader, Stat, cx } from "../components/ui";
import { QuestionCard, answerText, isCorrect, levelTone } from "../components/QuestionCard";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../components/charts";
import { downloadCSV } from "../lib/export";
import { fix } from "../engine/math";

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function startExam(p: ExamPreset, set: ReturnType<typeof useProgress.getState>["setActiveExam"]) {
  const refs = drawQuestions(p.pool, p.count);
  set({ id: `e${Date.now()}`, presetId: p.id, title: p.title, refs, answers: refs.map(() => null), flagged: refs.map(() => false), startedAt: Date.now(), timeLimitMin: p.minutes, current: 0 });
}

function List() {
  const { exams, activeExam, setActiveExam } = useProgress();
  const nav = useNavigate();
  const [custom, setCustom] = useState<{ levels: LevelId[]; count: number; minutes: number }>({ levels: [2, 3], count: 15, minutes: 60 });
  const go = (p: ExamPreset) => {
    startExam(p, setActiveExam);
    nav("/provas/ativa");
  };
  return (
    <div className="space-y-6">
      <PageHeader kicker="Avaliação" title="Provas e simulados" subtitle="Provas cronometradas no estilo de disciplinas de graduação. Cada tentativa sorteia questões e valores novos. A nota (0–10) e o desempenho por tópico vão para o seu painel." />
      {activeExam && (
        <Callout kind="warn" title="Você tem uma prova em andamento">
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {activeExam.title}
            <Button size="sm" variant="primary" onClick={() => nav("/provas/ativa")}>Continuar</Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveExam(null)}>Descartar</Button>
          </div>
        </Callout>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {EXAM_PRESETS.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="h-full">
              <div className="flex h-full flex-col">
                <div className="mb-1 flex items-center gap-2"><Badge tone="brand">{p.tag}</Badge><span className="text-xs text-muted">{p.count} questões · {p.minutes} min</span></div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{p.description}</p>
                <Button variant="primary" className="mt-3 self-start" onClick={() => go(p)}><Play className="size-4" /> Iniciar</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card title={<span className="flex items-center gap-2"><Settings2 className="size-4 text-brand" /> Prova personalizada</span>}>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="mb-1 text-[13px] font-medium text-muted">Níveis</div>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((l) => (
                <button key={l.id} onClick={() => setCustom((c) => ({ ...c, levels: c.levels.includes(l.id) ? c.levels.filter((x) => x !== l.id) : [...c.levels, l.id] }))} className={cx("rounded-full border px-3 py-1.5 text-[13px] font-medium", custom.levels.includes(l.id) ? "border-transparent text-white" : "border-line text-muted")} style={custom.levels.includes(l.id) ? { background: levelTone(l.id) } : undefined}>
                  {l.id} · {l.short}
                </button>
              ))}
            </div>
          </div>
          <label className="block w-28"><span className="mb-1 block text-[13px] font-medium text-muted">Questões</span><input type="number" min={3} max={60} className="h-10 w-full rounded-xl border border-line bg-surface px-3" value={custom.count} onChange={(e) => setCustom({ ...custom, count: Number(e.target.value) })} /></label>
          <label className="block w-28"><span className="mb-1 block text-[13px] font-medium text-muted">Minutos</span><input type="number" min={5} max={300} className="h-10 w-full rounded-xl border border-line bg-surface px-3" value={custom.minutes} onChange={(e) => setCustom({ ...custom, minutes: Number(e.target.value) })} /></label>
          <Button variant="primary" disabled={!custom.levels.length || !poolSize({ levels: custom.levels })} onClick={() => go({ id: "custom", title: `Prova personalizada (níveis ${custom.levels.sort().join(", ")})`, description: "", pool: { levels: custom.levels }, count: custom.count, minutes: custom.minutes, tag: "Personalizada" })}>
            <Play className="size-4" /> Gerar prova
          </Button>
        </div>
      </Card>
      <Card title="Histórico de provas" actions={exams.length > 0 && <Button size="sm" variant="ghost" onClick={() => downloadCSV(exams.map((e) => ({ prova: e.title, data: new Date(e.finishedAt).toLocaleString("pt-BR"), nota: e.grade, acertos: e.correct.filter(Boolean).length, questoes: e.refs.length, "duracao (min)": +((e.finishedAt - e.startedAt) / 60000).toFixed(1) })), "historico-provas")}>Exportar CSV</Button>}>
        {exams.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted"><th className="py-1.5">Prova</th><th>Data</th><th>Acertos</th><th>Tempo</th><th>Nota</th><th /></tr></thead>
              <tbody>
                {[...exams].reverse().map((e) => (
                  <tr key={e.id} className="border-t border-line">
                    <td className="py-2 font-medium">{e.title}</td>
                    <td className="text-muted">{new Date(e.finishedAt).toLocaleDateString("pt-BR")}</td>
                    <td className="num">{e.correct.filter(Boolean).length}/{e.refs.length}</td>
                    <td className="num">{mmss((e.finishedAt - e.startedAt) / 1000)}</td>
                    <td><span className={cx("num rounded-lg px-2 py-0.5 font-bold", e.grade >= 7 ? "bg-ok-soft text-ok" : e.grade >= 5 ? "bg-warn-soft text-warn" : "bg-bad-soft text-bad")}>{fix(e.grade, 1)}</span></td>
                    <td className="text-right"><Link className="text-brand hover:underline" to={`/provas/${e.id}`}>Revisar</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nenhuma prova realizada ainda.</Empty>
        )}
      </Card>
    </div>
  );
}

function Taking() {
  const { activeExam: ex, patchActiveExam, saveExam, addAttempt } = useProgress();
  const nav = useNavigate();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const questions = useMemo(() => (ex ? ex.refs.map((r) => instantiate(r)) : []), [ex?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = ex ? ex.timeLimitMin * 60 - (now - ex.startedAt) / 1000 : 0;

  const finish = () => {
    if (!ex) return;
    const correct = questions.map((q, i) => (q ? isCorrect(q, ex.answers[i]) : false));
    const res: ExamResult = { id: ex.id, presetId: ex.presetId, title: ex.title, startedAt: ex.startedAt, finishedAt: Date.now(), refs: ex.refs, answers: ex.answers, correct, grade: +((10 * correct.filter(Boolean).length) / ex.refs.length).toFixed(2), timeLimitMin: ex.timeLimitMin };
    const per = (res.finishedAt - res.startedAt) / ex.refs.length;
    questions.forEach((q, i) => q && addAttempt({ ref: q.id, topic: q.topic, level: q.level, difficulty: q.difficulty, correct: correct[i], ms: per, ts: res.finishedAt, mode: "prova", examId: ex.id, given: ex.answers[i] ?? "" }));
    saveExam(res);
    nav(`/provas/${res.id}`);
  };

  useEffect(() => {
    if (ex && left <= 0) finish();
  }, [left <= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ex) return <div className="space-y-3"><Empty>Nenhuma prova em andamento.</Empty><Link to="/provas"><Button>Ver provas</Button></Link></div>;
  const q = questions[ex.current];
  const answeredN = ex.answers.filter((a) => a !== null && a !== "").length;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-semibold">{ex.title}</h1>
          <div className={cx("num flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-lg font-semibold", left < 300 ? "bg-bad-soft text-bad" : "bg-surface-2")}>
            <AlarmClock className="size-5" /> {mmss(Math.max(0, left))}
          </div>
        </div>
        <Card>
          {q ? (
            <QuestionCard key={q.id} q={q} mode="prova" index={ex.current} value={ex.answers[ex.current]} onChange={(v) => patchActiveExam({ answers: ex.answers.map((a, i) => (i === ex.current ? v : a)) })} />
          ) : (
            <Callout kind="bad">Questão indisponível.</Callout>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <Button disabled={ex.current === 0} onClick={() => patchActiveExam({ current: ex.current - 1 })}><ArrowLeft className="size-4" /> Anterior</Button>
            <Button variant={ex.flagged[ex.current] ? "soft" : "ghost"} onClick={() => patchActiveExam({ flagged: ex.flagged.map((f, i) => (i === ex.current ? !f : f)) })}><Flag className="size-4" /> {ex.flagged[ex.current] ? "Marcada para revisar" : "Marcar para revisar"}</Button>
            {ex.current < ex.refs.length - 1 ? (
              <Button variant="primary" onClick={() => patchActiveExam({ current: ex.current + 1 })}>Próxima <ArrowRight className="size-4" /></Button>
            ) : (
              <Button variant="primary" onClick={() => confirm(`Entregar a prova? ${ex.refs.length - answeredN} questão(ões) em branco.`) && finish()}>Entregar</Button>
            )}
          </div>
        </Card>
      </div>
      <aside className="space-y-3">
        <Card title="Navegação" subtitle={`${answeredN}/${ex.refs.length} respondidas`}>
          <div className="grid grid-cols-5 gap-1.5">
            {ex.refs.map((_, i) => (
              <button
                key={i}
                onClick={() => patchActiveExam({ current: i })}
                className={cx(
                  "relative h-9 rounded-lg text-sm font-semibold transition-colors",
                  i === ex.current ? "ring-2 ring-brand" : "",
                  ex.answers[i] !== null && ex.answers[i] !== "" ? "bg-brand text-white dark:text-[#06201f]" : "bg-surface-2 text-muted"
                )}
              >
                {i + 1}
                {ex.flagged[i] && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-warn" />}
              </button>
            ))}
          </div>
          <Button variant="primary" className="mt-4 w-full" onClick={() => confirm("Entregar a prova agora?") && finish()}><ClipboardCheck className="size-4" /> Entregar prova</Button>
        </Card>
        <Callout kind="info">Respostas numéricas aceitam vírgula e notação científica (ex.: 1,8e-5). As respostas ficam salvas se você fechar a página.</Callout>
      </aside>
    </div>
  );
}

function ResultView({ id }: { id: string }) {
  const pal = usePalette();
  const { exams } = useProgress();
  const e = exams.find((x) => x.id === id);
  const questions = useMemo(() => (e ? e.refs.map((r) => instantiate(r)) : []), [e]);
  const [filter, setFilter] = useState<"todas" | "erradas">("todas");
  if (!e) return <Empty>Resultado não encontrado.</Empty>;
  const byTopic = new Map<string, { n: number; ok: number }>();
  questions.forEach((q, i) => {
    if (!q) return;
    const m = byTopic.get(q.topic) ?? { n: 0, ok: 0 };
    m.n++;
    if (e.correct[i]) m.ok++;
    byTopic.set(q.topic, m);
  });
  const chart = [...byTopic.entries()].map(([t, m]) => ({ topic: topicTitle(t), pct: Math.round((100 * m.ok) / m.n), n: m.n }));
  const dur = (e.finishedAt - e.startedAt) / 1000;
  return (
    <div className="space-y-5">
      <Link to="/provas" className="no-print inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Provas</Link>
      <PageHeader kicker={new Date(e.finishedAt).toLocaleString("pt-BR")} title={e.title} actions={<><Button onClick={() => window.print()}><Printer className="size-4" /> Imprimir / PDF</Button><Button onClick={() => downloadCSV(questions.map((q, i) => ({ n: i + 1, topico: q ? topicTitle(q.topic) : "", nivel: q?.level, resposta: q && q.kind === "mcq" && e.answers[i] !== null ? q.options?.[Number(e.answers[i])] : e.answers[i] ?? "", esperado: q ? answerText(q) : "", correta: e.correct[i] ? "sim" : "não" })), `prova-${e.title}`)}>Exportar CSV</Button></>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={cx("flex items-center gap-3 rounded-xl px-4 py-3", e.grade >= 7 ? "bg-ok-soft" : e.grade >= 5 ? "bg-warn-soft" : "bg-bad-soft")}>
          <Trophy className={cx("size-8", e.grade >= 7 ? "text-ok" : e.grade >= 5 ? "text-warn" : "text-bad")} />
          <div><div className="text-xs text-muted">Nota</div><div className="num text-3xl font-bold">{fix(e.grade, 1)}</div></div>
        </motion.div>
        <Stat label="Acertos" value={`${e.correct.filter(Boolean).length}/${e.refs.length}`} />
        <Stat label="Tempo usado" value={mmss(dur)} sub={`limite ${e.timeLimitMin} min`} />
        <Stat label="Em branco" value={e.answers.filter((a) => a === null || a === "").length} />
      </div>
      <ChartCard title="Desempenho por tópico" data={chart} csvName="prova-por-topico" height={Math.max(180, chart.length * 36)}>
        <ResponsiveContainer>
          <BarChart data={chart} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid stroke={pal.grid} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} {...axisProps(pal)} unit="%" />
            <YAxis type="category" dataKey="topic" {...axisProps(pal)} width={200} tick={{ fill: pal.muted, fontSize: 11 }} />
            <Tooltip {...tooltipStyle(pal)} formatter={(v) => `${v} %`} />
            <Bar dataKey="pct" radius={[0, 6, 6, 0]} animationDuration={800}>{chart.map((c, i) => <Cell key={i} fill={c.pct >= 70 ? pal.ok : c.pct >= 50 ? pal.warn : pal.bad} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <div className="no-print flex gap-2">
        <Button size="sm" variant={filter === "todas" ? "soft" : "ghost"} onClick={() => setFilter("todas")}>Todas</Button>
        <Button size="sm" variant={filter === "erradas" ? "soft" : "ghost"} onClick={() => setFilter("erradas")}>Só as erradas</Button>
      </div>
      <div className="space-y-4">
        {questions.map((q, i) =>
          !q || (filter === "erradas" && e.correct[i]) ? null : (
            <Card key={i} title={<span className="flex items-center gap-2">{e.correct[i] ? <CheckCircle2 className="size-5 text-ok" /> : <XCircle className="size-5 text-bad" />} Questão {i + 1}</span>}>
              <QuestionCard q={q} mode="prova" value={e.answers[i]} reveal />
            </Card>
          )
        )}
      </div>
    </div>
  );
}

export default function Exams() {
  const { examId } = useParams();
  if (!examId) return <List />;
  if (examId === "ativa") return <Taking />;
  return <ResultView id={examId} />;
}

