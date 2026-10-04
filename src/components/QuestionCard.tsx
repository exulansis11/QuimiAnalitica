import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, HelpCircle, Lightbulb, XCircle } from "lucide-react";
import type { Question } from "../data/questions/types";
import { checkNumeric } from "../data/questions/types";
import { topicTitle } from "../data/questions";
import { LEVELS } from "../data/curriculum";
import { parseNum } from "../engine/math";
import { Badge, Button, Callout, Inline, Steps, cx } from "./ui";

export function levelTone(level: number) {
  return `var(--l${level})`;
}

export function QuestionMeta({ q }: { q: Question }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `color-mix(in srgb, ${levelTone(q.level)} 15%, transparent)`, color: levelTone(q.level) }}>
        Nível {q.level} · {LEVELS[q.level].short}
      </span>
      <Badge>{topicTitle(q.topic)}</Badge>
      <Badge tone={q.difficulty === 3 ? "bad" : q.difficulty === 2 ? "warn" : "ok"}>{["", "Fácil", "Médio", "Difícil"][q.difficulty]}</Badge>
      {q.kind === "num" && <Badge tone="brand">Numérica</Badge>}
    </div>
  );
}

/** Verifica a resposta textual contra a questão. */
export function isCorrect(q: Question, given: string | null): boolean {
  if (given === null || given === "") return false;
  if (q.kind === "mcq") return Number(given) === q.correct;
  return checkNumeric(q, parseNum(given));
}

export function answerText(q: Question) {
  if (q.kind === "mcq") return q.options?.[q.correct ?? 0] ?? "";
  const a = q.answer!;
  const s = Math.abs(a) >= 1e5 || (Math.abs(a) < 1e-3 && a !== 0) ? a.toExponential(3).replace(".", ",") : String(+a.toPrecision(4)).replace(".", ",");
  return `${s}${q.unit ? " " + q.unit : ""}`;
}

/**
 * Questão interativa.
 *  - mode "pratica": confere na hora, mostra resolução.
 *  - mode "prova": só registra a resposta (onChange).
 */
export function QuestionCard({
  q,
  mode = "pratica",
  value,
  onChange,
  onResult,
  reveal = false,
  index,
}: {
  q: Question;
  mode?: "pratica" | "prova";
  value?: string | null;
  onChange?: (v: string | null) => void;
  onResult?: (correct: boolean, given: string, ms: number) => void;
  reveal?: boolean;
  index?: number;
}) {
  const [given, setGiven] = useState<string>(value ?? "");
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const t0 = useRef(Date.now());
  useEffect(() => {
    setGiven(value ?? "");
    setChecked(false);
    setShowHint(false);
    t0.current = Date.now();
  }, [q.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const done = checked || reveal;
  const ok = isCorrect(q, given);

  const submit = () => {
    if (given === "" || checked) return;
    setChecked(true);
    onResult?.(ok, given, Date.now() - t0.current);
  };

  const set = (v: string) => {
    if (done) return;
    setGiven(v);
    onChange?.(v === "" ? null : v);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <QuestionMeta q={q} />
        {q.title && <span className="text-xs text-muted">{q.title}</span>}
      </div>
      <div className="text-[16px] leading-relaxed">
        {index !== undefined && <span className="mr-1.5 font-bold text-brand">{index + 1}.</span>}
        <Inline text={q.statement} />
      </div>

      {q.kind === "mcq" ? (
        <div className="grid gap-2">
          {q.options!.map((opt, i) => {
            const sel = given === String(i);
            const isRight = i === q.correct;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: done ? 1 : 0.99 }}
                onClick={() => set(String(i))}
                className={cx(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-[15px] transition-colors",
                  !done && sel && "border-brand bg-brand-soft",
                  !done && !sel && "border-line hover:border-brand/50 hover:bg-surface-2",
                  done && isRight && "border-ok bg-ok-soft",
                  done && sel && !isRight && "border-bad bg-bad-soft",
                  done && !sel && !isRight && "border-line opacity-60"
                )}
              >
                <span className={cx("grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold", sel ? "border-brand bg-brand text-white dark:text-[#06201f]" : "border-line")}>{String.fromCharCode(65 + i)}</span>
                <span className="pt-0.5"><Inline text={opt} /></span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <label className="block min-w-0 flex-1 sm:max-w-xs">
            <span className="mb-1 block text-[13px] font-medium text-muted">Sua resposta {q.unit && `(${q.unit})`}</span>
            <input
              inputMode="decimal"
              disabled={done}
              value={given}
              placeholder="ex.: 4,75 ou 1,8e-5"
              onChange={(e) => set(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && mode === "pratica" && submit()}
              className={cx("num h-11 w-full rounded-xl border bg-surface px-3 text-[16px] outline-none focus:border-brand", done ? (ok ? "border-ok" : "border-bad") : "border-line")}
            />
          </label>
          <div className="pb-2.5 text-xs text-muted">{q.absTol !== undefined ? `tolerância ±${String(q.absTol).replace(".", ",")}` : `tolerância ±${Math.round((q.tol ?? 0.02) * 1000) / 10} %`}</div>
        </div>
      )}

      {mode === "pratica" && !done && (
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={submit} disabled={given === ""}>Verificar</Button>
          {q.hint && <Button variant="ghost" onClick={() => setShowHint(true)}><Lightbulb className="size-4" /> Dica</Button>}
          <Button variant="ghost" onClick={() => { setChecked(true); onResult?.(false, "", Date.now() - t0.current); }}>
            <HelpCircle className="size-4" /> Ver resolução
          </Button>
        </div>
      )}
      <AnimatePresence>
        {showHint && !done && q.hint && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            <Callout kind="tip"><Inline text={q.hint} /></Callout>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {given !== "" ? (
              <div className={cx("flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[15px] font-semibold", ok ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad")}>
                {ok ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                {ok ? "Correto!" : "Incorreto."}
                {!ok && <span className="font-normal text-ink">Resposta esperada: <b>{answerText(q)}</b></span>}
              </div>
            ) : (
              <div className="rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm">Resposta esperada: <b>{answerText(q)}</b></div>
            )}
            <Steps steps={q.steps} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
