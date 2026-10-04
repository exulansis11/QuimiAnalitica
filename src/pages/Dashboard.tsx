import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Download, Flame, Printer, Target, Timer, TrendingUp } from "lucide-react";
import { LEVELS, TOPICS } from "../data/curriculum";
import { topicTitle } from "../data/questions";
import { dayKey, mastery, streakDays, useProgress, type Attempt } from "../store/progress";
import { Button, Card, Empty, PageHeader, Segmented, Stat, cx } from "../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../components/charts";
import { downloadCSV, downloadJSON } from "../lib/export";
import { fix } from "../engine/math";
import { levelTone } from "../components/QuestionCard";

type Period = "7" | "30" | "90" | "all";

function Heatmap({ days }: { days: Record<string, number> }) {
  // últimas 18 semanas, colunas = semanas
  const weeks = 18;
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - (weeks * 7 - 1) - end.getDay());
  const cells: { key: string; v: number; date: Date }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const k = dayKey(d.getTime());
    cells.push({ key: k, v: days[k] ?? 0, date: new Date(d) });
  }
  const max = Math.max(1, ...cells.map((c) => c.v));
  const cols = Math.ceil(cells.length / 7);
  return (
    <div className="overflow-x-auto">
      <svg width={cols * 15 + 30} height={7 * 15 + 18}>
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => i % 2 === 1 && <text key={i} x={0} y={i * 15 + 28} fontSize="9" fill="var(--muted)">{d}</text>)}
        {cells.map((c, i) => {
          const col = Math.floor(i / 7), row = i % 7;
          const t = c.v / max;
          return (
            <rect key={c.key} x={18 + col * 15} y={16 + row * 15} width={12} height={12} rx={3} fill={c.v ? `color-mix(in srgb, var(--brand) ${Math.round(20 + 80 * t)}%, var(--surface-2))` : "var(--surface-2)"}>
              <title>{c.date.toLocaleDateString("pt-BR")}: {c.v} questões</title>
            </rect>
          );
        })}
        {cells.filter((c) => c.date.getDate() === 1).map((c) => {
          const i = cells.indexOf(c);
          return <text key={c.key} x={18 + Math.floor(i / 7) * 15} y={10} fontSize="9" fill="var(--muted)">{c.date.toLocaleDateString("pt-BR", { month: "short" })}</text>;
        })}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const pal = usePalette();
  const { attempts, exams, studySeconds, studied } = useProgress();
  const [period, setPeriod] = useState<Period>("30");
  const [mode, setMode] = useState<"todos" | "pratica" | "prova">("todos");
  const [levelF, setLevelF] = useState<number | null>(null);

  const since = period === "all" ? 0 : Date.now() - Number(period) * 864e5;
  const A = useMemo(() => attempts.filter((a) => a.ts >= since && (mode === "todos" || a.mode === mode) && (levelF === null || a.level === levelF)), [attempts, since, mode, levelF]);

  const total = A.length;
  const correct = A.filter((a) => a.correct).length;
  const acc = total ? (100 * correct) / total : 0;
  const avgTime = total ? A.reduce((s, a) => s + a.ms, 0) / total / 1000 : 0;
  const minutes = Object.entries(studySeconds).filter(([k]) => period === "all" || new Date(k).getTime() >= since - 864e5).reduce((s, [, v]) => s + v, 0) / 60;

  const topicRows = useMemo(
    () =>
      TOPICS.filter((t) => levelF === null || t.level === levelF).map((t) => {
        const xs = A.filter((a) => a.topic === t.id);
        return { id: t.id, topic: t.title.length > 30 ? t.title.slice(0, 29) + "…" : t.title, level: t.level, n: xs.length, acc: xs.length ? Math.round((100 * xs.filter((a) => a.correct).length) / xs.length) : 0, mastery: mastery(attempts, t.id) ?? 0, studied: !!studied[t.id] };
      }),
    [A, attempts, levelF, studied]
  );

  const radar = LEVELS.map((l) => {
    const xs = A.filter((a) => a.level === l.id);
    return { nivel: `${l.id} ${l.short}`, acerto: xs.length ? Math.round((100 * xs.filter((a) => a.correct).length) / xs.length) : 0, dominio: Math.round(TOPICS.filter((t) => t.level === l.id).reduce((s, t) => s + (mastery(attempts, t.id) ?? 0), 0) / TOPICS.filter((t) => t.level === l.id).length) };
  });

  const daily = useMemo(() => {
    const m = new Map<string, Attempt[]>();
    A.forEach((a) => m.set(dayKey(a.ts), [...(m.get(dayKey(a.ts)) ?? []), a]));
    return [...m.entries()].sort(([x], [y]) => x.localeCompare(y)).map(([d, xs]) => ({ dia: d.slice(5).split("-").reverse().join("/"), questoes: xs.length, acerto: Math.round((100 * xs.filter((a) => a.correct).length) / xs.length) }));
  }, [A]);

  const examSeries = exams.filter((e) => e.finishedAt >= since).map((e) => ({ data: new Date(e.finishedAt).toLocaleDateString("pt-BR"), nota: e.grade, prova: e.title }));
  const perDay: Record<string, number> = {};
  attempts.forEach((a) => (perDay[dayKey(a.ts)] = (perDay[dayKey(a.ts)] ?? 0) + 1));

  const diffRows = [1, 2, 3].map((d) => {
    const xs = A.filter((a) => a.difficulty === d);
    return { dificuldade: ["", "Fácil", "Médio", "Difícil"][d], acerto: xs.length ? Math.round((100 * xs.filter((a) => a.correct).length) / xs.length) : 0, tempo: xs.length ? +(xs.reduce((s, a) => s + a.ms, 0) / xs.length / 1000).toFixed(1) : 0, n: xs.length };
  });

  const exportRaw = () =>
    downloadCSV(
      attempts.map((a) => ({ data: new Date(a.ts).toLocaleString("pt-BR"), modo: a.mode, nivel: a.level, topico: topicTitle(a.topic), dificuldade: a.difficulty, correta: a.correct ? 1 : 0, "tempo (s)": +(a.ms / 1000).toFixed(1), questao: a.ref, resposta: a.given ?? "" })),
      "tentativas-todas"
    );

  const weakest = [...topicRows].filter((r) => r.n > 0).sort((a, b) => a.mastery - b.mastery).slice(0, 4);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Desempenho"
        title="Painel interativo"
        subtitle="Filtre por período, modo e nível. Clique nos botões dos gráficos para exportar PNG, SVG ou CSV; imprima o painel como relatório em PDF."
        actions={
          <>
            <Button onClick={exportRaw}><Download className="size-4" /> Tentativas (CSV)</Button>
            <Button onClick={() => downloadJSON({ gerado: new Date().toISOString(), filtros: { period, mode, levelF }, resumo: { total, acc, avgTime, minutes }, topicos: topicRows, provas: exams }, "painel-resumo")}>JSON</Button>
            <Button onClick={() => window.print()}><Printer className="size-4" /> PDF</Button>
          </>
        }
      />
      <div className="no-print flex flex-wrap items-center gap-2">
        <Segmented value={period} onChange={setPeriod} options={[{ value: "7", label: "7 dias" }, { value: "30", label: "30 dias" }, { value: "90", label: "90 dias" }, { value: "all", label: "Tudo" }]} />
        <Segmented value={mode} onChange={setMode} options={[{ value: "todos", label: "Tudo" }, { value: "pratica", label: "Prática" }, { value: "prova", label: "Provas" }]} />
        <div className="flex flex-wrap gap-1">
          <button onClick={() => setLevelF(null)} className={cx("rounded-full border px-2.5 py-1 text-xs font-medium", levelF === null ? "border-brand bg-brand-soft text-brand" : "border-line text-muted")}>Todos os níveis</button>
          {LEVELS.map((l) => <button key={l.id} onClick={() => setLevelF(levelF === l.id ? null : l.id)} className={cx("rounded-full border px-2.5 py-1 text-xs font-medium", levelF === l.id ? "border-transparent text-white" : "border-line text-muted")} style={levelF === l.id ? { background: levelTone(l.id) } : undefined}>N{l.id}</button>)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Questões" value={total} sub={`${correct} corretas`} />
        <Stat label="Taxa de acerto" value={total ? `${fix(acc, 0)}%` : "—"} tone={acc >= 70 ? "ok" : total ? "bad" : undefined} />
        <Stat label="Tempo médio/questão" value={total ? fix(avgTime, 0) : "—"} unit="s" />
        <Stat label="Tempo de estudo" value={fix(minutes, 0)} unit="min" />
        <Stat label="Sequência" value={<span className="inline-flex items-center gap-1"><Flame className="size-5 text-warn" />{streakDays(studySeconds, attempts)}</span>} unit="dias" />
      </div>

      {total === 0 && exams.length === 0 ? (
        <Card>
          <Empty>
            Ainda não há dados para este filtro. <Link to="/praticar" className="text-brand underline">Pratique algumas questões</Link> ou <Link to="/provas" className="text-brand underline">faça uma prova</Link> para popular o painel.
          </Empty>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <ChartCard title="Domínio por tópico" subtitle="Média móvel das respostas (recentes pesam mais); cor = nível" data={topicRows.map((r) => ({ topico: r.topic, nivel: r.level, tentativas: r.n, "acerto %": r.acc, "dominio": r.mastery }))} csvName="dominio-por-topico" height={Math.max(300, topicRows.length * 26 + 40)}>
              <ResponsiveContainer>
                <BarChart data={topicRows} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke={pal.grid} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} {...axisProps(pal)} />
                  <YAxis type="category" dataKey="topic" {...axisProps(pal)} width={210} tick={{ fill: pal.muted, fontSize: 11 }} interval={0} />
                  <Tooltip {...tooltipStyle(pal)} formatter={(v, n) => [`${v}`, n === "mastery" ? "domínio" : String(n)]} />
                  <Bar dataKey="mastery" radius={[0, 5, 5, 0]} animationDuration={800}>{topicRows.map((r) => <Cell key={r.id} fill={pal.levels[r.level]} fillOpacity={r.n ? 1 : 0.25} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="space-y-5">
              <ChartCard title="Perfil por nível" data={radar} csvName="perfil-por-nivel" height={300}>
                <ResponsiveContainer>
                  <RadarChart data={radar} outerRadius="72%">
                    <PolarGrid stroke={pal.grid} />
                    <PolarAngleAxis dataKey="nivel" tick={{ fill: pal.muted, fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Acerto (%)" dataKey="acerto" stroke={pal.brand} fill={pal.brand} fillOpacity={0.25} />
                    <Radar name="Domínio" dataKey="dominio" stroke={pal.series[1]} fill={pal.series[1]} fillOpacity={0.12} />
                    <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip {...tooltipStyle(pal)} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
              <Card title={<span className="flex items-center gap-2"><Target className="size-4 text-bad" /> Prioridades de estudo</span>}>
                {weakest.length ? (
                  <div className="space-y-2">
                    {weakest.map((w) => (
                      <Link key={w.id} to={`/topico/${w.id}`} className="flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-sm hover:bg-brand-soft">
                        <span>{w.topic}</span>
                        <span className={cx("num font-semibold", w.mastery < 50 ? "text-bad" : "text-warn")}>{w.mastery}</span>
                      </Link>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted">Responda mais questões para receber recomendações.</p>}
              </Card>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Evolução diária" subtitle="Barras = questões; linha = % de acerto" data={daily} csvName="evolucao-diaria" height={280}>
              <ResponsiveContainer>
                <ComposedChart data={daily} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dia" {...axisProps(pal)} />
                  <YAxis yAxisId="n" {...axisProps(pal)} width={32} allowDecimals={false} />
                  <YAxis yAxisId="p" orientation="right" domain={[0, 100]} {...axisProps(pal)} width={36} unit="%" />
                  <Tooltip {...tooltipStyle(pal)} />
                  <Bar yAxisId="n" dataKey="questoes" name="Questões" fill={pal.brand} fillOpacity={0.35} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="p" dataKey="acerto" name="Acerto %" stroke={pal.series[1]} strokeWidth={2.4} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Notas das provas" data={examSeries} csvName="notas-provas" height={280}>
              {examSeries.length ? (
                <ResponsiveContainer>
                  <LineChart data={examSeries} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                    <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="data" {...axisProps(pal)} />
                    <YAxis domain={[0, 10]} {...axisProps(pal)} width={30} />
                    <Tooltip {...tooltipStyle(pal)} labelFormatter={(_, p) => (p?.[0]?.payload as { prova?: string })?.prova ?? ""} />
                    <Line dataKey="nota" stroke={pal.brand} strokeWidth={2.6} dot={{ r: 5, fill: pal.brand }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <Empty>Nenhuma prova no período.</Empty>}
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
            <ChartCard title="Acerto e tempo por dificuldade" data={diffRows} csvName="dificuldade" height={240}>
              <ResponsiveContainer>
                <ComposedChart data={diffRows} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dificuldade" {...axisProps(pal)} />
                  <YAxis yAxisId="p" domain={[0, 100]} {...axisProps(pal)} width={36} unit="%" />
                  <YAxis yAxisId="t" orientation="right" {...axisProps(pal)} width={36} unit="s" />
                  <Tooltip {...tooltipStyle(pal)} />
                  <Bar yAxisId="p" dataKey="acerto" name="Acerto %" radius={[6, 6, 0, 0]}>{diffRows.map((_, i) => <Cell key={i} fill={[pal.ok, pal.warn, pal.bad][i]} />)}</Bar>
                  <Line yAxisId="t" dataKey="tempo" name="Tempo médio (s)" stroke={pal.ink} strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>
            <Card title={<span className="flex items-center gap-2"><Timer className="size-4 text-brand" /> Atividade (últimas 18 semanas)</span>} subtitle="Cada quadrado = um dia; mais escuro = mais questões">
              <Heatmap days={perDay} />
              <div className="mt-3 flex items-center gap-2 text-xs text-muted"><TrendingUp className="size-3.5" /> {Object.keys(perDay).length} dias com atividade · {TOPICS.filter((t) => studied[t.id]).length}/{TOPICS.length} tópicos marcados como estudados</div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
