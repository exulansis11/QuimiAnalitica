import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CheckCircle2, Circle, FlaskConical, RefreshCw, Sigma, Target } from "lucide-react";
import { LEVELS, TOPICS, TOPIC_BY_ID } from "../data/curriculum";
import { drawQuestions, instantiate, poolSize } from "../data/questions";
import { mastery, useProgress } from "../store/progress";
import { Badge, Button, Card, PageHeader, Rich, Tex } from "../components/ui";
import { QuestionCard, levelTone } from "../components/QuestionCard";
import { MasteryRing } from "./Trail";

const KIND_ICON = { simulador: FlaskConical, calculadora: Calculator, "laboratório": Sigma } as const;

export default function TopicPage() {
  const { id = "" } = useParams();
  const topic = TOPIC_BY_ID[id] ?? TOPICS[0];
  const idx = TOPICS.indexOf(topic);
  const { attempts, studied, toggleStudied, visit, addAttempt } = useProgress();
  const [seed, setSeed] = useState(() => Date.now());
  const refs = useMemo(() => drawQuestions({ topics: [topic.id] }, 5, seed), [topic.id, seed]);
  const [qi, setQi] = useState(0);
  const q = useMemo(() => (refs[qi] ? instantiate(refs[qi]) : null), [refs, qi]);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    visit(topic.id);
    setQi(0);
    setAnswered(false);
  }, [topic.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const m = mastery(attempts, topic.id);
  const color = levelTone(topic.level);

  return (
    <div className="space-y-5">
      <Link to="/trilha" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Trilha</Link>
      <PageHeader
        kicker={<span style={{ color }}>Nível {topic.level} · {LEVELS[topic.level].name}</span>}
        title={topic.title}
        subtitle={topic.summary}
        actions={
          <>
            <Button variant={studied[topic.id] ? "soft" : "outline"} onClick={() => toggleStudied(topic.id)}>
              {studied[topic.id] ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />} {studied[topic.id] ? "Estudado" : "Marcar como estudado"}
            </Button>
            <div className="flex items-center gap-2 rounded-xl border border-line px-2 py-1">
              <MasteryRing value={m} color={color} size={36} />
              <span className="text-xs text-muted">domínio</span>
            </div>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-5">
          <Card title={<span className="flex items-center gap-2"><Target className="size-4 text-brand" /> Objetivos</span>}>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {topic.objectives.map((o) => (
                <li key={o} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" /> {o}</li>
              ))}
            </ul>
          </Card>

          {topic.theory.map((s, i) => (
            <motion.div key={s.heading} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card title={<span className="flex items-center gap-2"><BookOpen className="size-4 text-brand" /> {s.heading}</span>}>
                <Rich text={s.body} className="text-[15px]" />
              </Card>
            </motion.div>
          ))}

          <Card
            title="Pratique este tópico"
            subtitle={`${poolSize({ topics: [topic.id] })} modelos de questão · valores novos a cada rodada`}
            actions={<Button size="sm" variant="ghost" onClick={() => { setSeed(Date.now()); setQi(0); setAnswered(false); }}><RefreshCw className="size-4" /> Novas questões</Button>}
          >
            {q ? (
              <>
                <div className="mb-3 flex gap-1">
                  {refs.map((_, i) => <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i < qi ? color : i === qi ? `color-mix(in srgb, ${color} 50%, transparent)` : "var(--surface-2)" }} />)}
                </div>
                <QuestionCard
                  key={q.id}
                  q={q}
                  index={qi}
                  onResult={(ok, given, ms) => {
                    setAnswered(true);
                    if (given !== "") addAttempt({ ref: q.id, topic: q.topic, level: q.level, difficulty: q.difficulty, correct: ok, ms, ts: Date.now(), mode: "pratica", given });
                  }}
                />
                {answered && (
                  <div className="mt-4 flex justify-end">
                    {qi < refs.length - 1 ? (
                      <Button variant="primary" onClick={() => { setQi(qi + 1); setAnswered(false); }}>Próxima <ArrowRight className="size-4" /></Button>
                    ) : (
                      <Button variant="primary" onClick={() => { setSeed(Date.now()); setQi(0); setAnswered(false); }}><RefreshCw className="size-4" /> Nova rodada</Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted">Sem questões para este tópico.</p>
            )}
          </Card>
        </div>

        <aside className="space-y-5">
          <Card title="Fórmulas-chave">
            <div className="space-y-3">
              {topic.formulas.map((f) => (
                <div key={f.label} className="rounded-xl bg-surface-2 px-3 py-2">
                  <div className="text-xs font-medium text-muted">{f.label}</div>
                  <Tex block>{f.tex}</Tex>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Ferramentas relacionadas">
            <div className="space-y-2">
              {topic.tools.map((t) => {
                const Icon = KIND_ICON[t.kind];
                return (
                  <Link key={t.to + t.label} to={t.to} className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-sm transition-colors hover:border-brand/50 hover:bg-surface-2">
                    <Icon className="size-4 shrink-0 text-brand" />
                    <span className="flex-1">{t.label}</span>
                    <Badge>{t.kind}</Badge>
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card title="Referências">
            <p className="text-sm text-muted">{topic.refs}</p>
          </Card>
          <div className="flex gap-2">
            {idx > 0 && (
              <Link to={`/topico/${TOPICS[idx - 1].id}`} className="flex-1"><Button className="w-full"><ArrowLeft className="size-4" /> Anterior</Button></Link>
            )}
            {idx < TOPICS.length - 1 && (
              <Link to={`/topico/${TOPICS[idx + 1].id}`} className="flex-1"><Button variant="primary" className="w-full">Próximo <ArrowRight className="size-4" /></Button></Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
