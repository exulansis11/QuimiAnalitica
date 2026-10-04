import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { LEVELS, topicsOfLevel } from "../data/curriculum";
import { mastery, useProgress } from "../store/progress";
import { PageHeader } from "../components/ui";
import { levelTone } from "../components/QuestionCard";

export function MasteryRing({ value, color, size = 44 }: { value: number | null; color: string; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const v = value ?? 0;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth="4" />
      <motion.circle transform={`rotate(-90 ${size / 2} ${size / 2})`} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - v / 100) }} transition={{ duration: 0.8 }} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-current text-[11px] font-semibold">
        {value === null ? "—" : v}
      </text>
    </svg>
  );
}

export default function Trail() {
  const { attempts, studied } = useProgress();
  const loc = useLocation();
  useEffect(() => {
    const id = loc.hash.replace("#", "");
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  }, [loc.hash]);

  return (
    <div>
      <PageHeader kicker="Trilha de estudo" title="Do elementar ao avançado" subtitle="Siga os níveis em ordem ou pule para o que precisa. O anel mostra seu domínio (0–100) calculado pelas suas respostas recentes." />
      <div className="relative space-y-8">
        {LEVELS.map((l) => (
          <section key={l.id} id={`nivel-${l.id}`} className="scroll-mt-20">
            <div className="mb-3 flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl text-xl font-bold text-white shadow-sm" style={{ background: levelTone(l.id) }}>{l.id}</div>
              <div>
                <h2 className="text-lg font-semibold">{l.name}</h2>
                <p className="text-sm text-muted">{l.description}</p>
              </div>
            </div>
            <div className="ml-5 border-l-2 border-dashed pl-6" style={{ borderColor: `color-mix(in srgb, ${levelTone(l.id)} 40%, transparent)` }}>
              <div className="grid gap-2.5 md:grid-cols-2">
                {topicsOfLevel(l.id).map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Link to={`/topico/${t.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-brand/50">
                      <MasteryRing value={mastery(attempts, t.id)} color={levelTone(l.id)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 font-semibold leading-snug">
                          {t.title}
                          {studied[t.id] && <CheckCircle2 className="size-4 shrink-0 text-ok" />}
                        </div>
                        <div className="line-clamp-2 text-sm text-muted">{t.summary}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
