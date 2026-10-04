import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ClipboardCheck, FlaskConical, Flame, GraduationCap, Microscope, Sigma, Target, TestTubes, Timer, Waves, LineChart } from "lucide-react";
import { LEVELS, TOPICS, topicsOfLevel } from "../data/curriculum";
import { FIXED, GENERATORS } from "../data/questions";
import { mastery, streakDays, useProgress } from "../store/progress";
import { Button, Card, Progress, Stat } from "../components/ui";
import { levelTone } from "../components/QuestionCard";

function HeroFlask() {
  // Erlenmeyer animado: bolhas sobem e a cor do indicador "vira"
  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40 sm:h-48 sm:w-48" aria-hidden>
      <defs>
        <clipPath id="flask-clip">
          <path d="M80 30 h40 v45 l45 85 a12 12 0 0 1 -10.5 18 h-109 a12 12 0 0 1 -10.5 -18 l45 -85 z" />
        </clipPath>
      </defs>
      <g clipPath="url(#flask-clip)">
        <motion.rect x="0" width="200" height="200" initial={{ y: 200 }} animate={{ y: 110 }} transition={{ duration: 1.2, ease: "easeOut" }} fill="var(--brand)" opacity="0.25" />
        <motion.rect x="0" y="110" width="200" height="90" animate={{ fill: ["#2f7fd6", "#e0399a", "#2f7fd6"] }} transition={{ duration: 6, repeat: Infinity }} opacity="0.55" />
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle key={i} cx={70 + i * 16} r={3 + (i % 3)} fill="white" opacity="0.7" initial={{ cy: 185 }} animate={{ cy: [185, 115], opacity: [0.8, 0] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }} />
        ))}
      </g>
      <path d="M80 30 h40 v45 l45 85 a12 12 0 0 1 -10.5 18 h-109 a12 12 0 0 1 -10.5 -18 l45 -85 z" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M74 30 h52" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <motion.path d="M100 0 v22" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 6" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
    </svg>
  );
}

const SIMS = [
  { to: "/simuladores/titulacao", label: "Titulação animada", desc: "Bureta, gotas e indicador virando em tempo real", icon: FlaskConical },
  { to: "/simuladores/curvas", label: "Curvas de titulação", desc: "Ácido-base, EDTA, precipitação e redox", icon: LineChart },
  { to: "/simuladores/especies", label: "Espécies α × pH", desc: "Polipróticos animados", icon: Waves },
  { to: "/simuladores/espectro", label: "Espectrofotômetro", desc: "Feixe, cubeta, Beer e curva analítica", icon: Microscope },
  { to: "/simuladores/cromatografia", label: "Cromatógrafo", desc: "Bandas migrando e picos surgindo", icon: TestTubes },
  { to: "/simuladores/estatistica", label: "Estatística visual", desc: "Alvo, normal e intervalos de confiança", icon: Target },
];

export default function Home() {
  const { attempts, exams, studySeconds, name } = useProgress();
  const total = attempts.length;
  const acc = total ? Math.round((100 * attempts.filter((a) => a.correct).length) / total) : 0;
  const streak = streakDays(studySeconds, attempts);
  const minutes = Math.round(Object.values(studySeconds).reduce((a, b) => a + b, 0) / 60);

  // recomendação: tópico com menor domínio já praticado, ou o primeiro não praticado
  const scored = TOPICS.map((t) => ({ t, m: mastery(attempts, t.id) }));
  const weak = scored.filter((x) => x.m !== null).sort((a, b) => a.m! - b.m!)[0];
  const next = weak && weak.m! < 70 ? weak.t : scored.find((x) => x.m === null)?.t ?? TOPICS[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative flex flex-col-reverse items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 text-sm font-semibold text-brand">{name ? `Olá, ${name}!` : "Química Analítica"} · do elementar ao avançado</div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Aprenda, simule, calcule e pratique — tudo num só lugar.</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {TOPICS.length} tópicos em 6 níveis, {GENERATORS.length} geradores de questões com valores sempre novos, {FIXED.length} questões conceituais estilo prova, simuladores animados com cálculo exato e um painel com seu desempenho para exportar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to={`/topico/${next.id}`}><Button variant="primary" size="lg">Continuar: {next.title.length > 28 ? next.title.slice(0, 26) + "…" : next.title} <ArrowRight className="size-4" /></Button></Link>
              <Link to="/provas"><Button size="lg"><ClipboardCheck className="size-4" /> Fazer uma prova</Button></Link>
            </div>
          </div>
          <HeroFlask />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Questões respondidas" value={total} />
        <Stat label="Taxa de acerto" value={total ? `${acc}%` : "—"} tone={acc >= 70 ? "ok" : undefined} />
        <Stat label="Sequência de estudo" value={<span className="inline-flex items-center gap-1"><Flame className="size-5 text-warn" />{streak}</span>} unit={streak === 1 ? "dia" : "dias"} />
        <Stat label="Tempo de estudo" value={minutes} unit="min" sub={`${exams.length} prova(s) feita(s)`} />
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Trilha por níveis</h2>
          <Link to="/trilha" className="text-sm font-medium text-brand hover:underline">Ver trilha completa →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((l, i) => {
            const ts = topicsOfLevel(l.id);
            const ms = ts.map((t) => mastery(attempts, t.id) ?? 0);
            const avg = Math.round(ms.reduce((a, b) => a + b, 0) / ts.length);
            return (
              <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/trilha#nivel-${l.id}`} className="block h-full rounded-2xl border border-line bg-surface p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl text-lg font-bold text-white" style={{ background: levelTone(l.id) }}>{l.id}</div>
                    <div className="min-w-0">
                      <div className="font-semibold">{l.name}</div>
                      <div className="text-xs text-muted">{ts.length} tópicos</div>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{l.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Progress value={avg} className="flex-1" />
                    <span className="num w-10 text-right text-xs text-muted">{avg}%</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Simuladores animados</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SIMS.map((s) => (
            <Link key={s.to} to={s.to} className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/50">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-transform group-hover:scale-110"><s.icon className="size-5" /></div>
              <div>
                <div className="font-semibold">{s.label}</div>
                <div className="text-sm text-muted">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Laboratório de dados" subtitle="Cole seus dados de aula prática">
          <p className="text-sm text-muted">Curva de calibração com LOD/LOQ, estatística com testes, ponto final por derivadas. Exporte CSV, PNG e relatório.</p>
          <Link to="/laboratorio"><Button className="mt-3" variant="soft"><Sigma className="size-4" /> Abrir laboratório</Button></Link>
        </Card>
        <Card title="Treino adaptativo" subtitle="Questões com resolução passo a passo">
          <p className="text-sm text-muted">Escolha tópicos e níveis; cada gerador cria valores novos, então dá para treinar sem decorar respostas.</p>
          <Link to="/praticar"><Button className="mt-3" variant="soft"><GraduationCap className="size-4" /> Praticar</Button></Link>
        </Card>
        <Card title="Painel interativo" subtitle="Seu desempenho em gráficos">
          <p className="text-sm text-muted">Domínio por tópico, evolução, provas e tempo de estudo — com exportação para Excel e impressão em PDF.</p>
          <Link to="/painel"><Button className="mt-3" variant="soft"><BarChart3 className="size-4" /> Ver painel</Button></Link>
        </Card>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted"><Timer className="size-3.5" /> Seu progresso fica salvo neste navegador. Faça backup em “Meus dados”.</p>
    </div>
  );
}
