import katex from "katex";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Info, Lightbulb } from "lucide-react";
import { parseNum } from "../engine/math";

export const cx = clsx;

/* ------------------------------ TeX ------------------------------ */

export function Tex({ children, block = false }: { children: string; block?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, { displayMode: block, throwOnError: false, strict: false });
    } catch {
      return children;
    }
  }, [children, block]);
  return block ? <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} /> : <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Renderiza texto inline com $TeX$ e **negrito**. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("$") && p.endsWith("$") && p.length > 1) return <Tex key={i}>{p.slice(1, -1)}</Tex>;
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/**
 * Mini-markdown para teoria (por linhas): parágrafos, listas (- / 1.), $$bloco$$,
 * #### subtítulo, tabelas (| a | b |) e caixas "> dica".
 */
export function Rich({ text, className }: { text: string; className?: string }) {
  const lines = text.trim().split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  const take = (pred: (l: string) => boolean) => {
    const acc: string[] = [];
    while (i < lines.length && pred(lines[i])) acc.push(lines[i++]);
    return acc;
  };
  while (i < lines.length) {
    const l = lines[i];
    const t = l.trim();
    const k = out.length;
    if (t === "") { i++; continue; }
    if (t.startsWith("$$")) {
      const acc: string[] = [lines[i++]];
      const closed = (x: string) => x.trim().length > 2 && x.trim().endsWith("$$");
      if (!closed(acc[0])) while (i < lines.length) { const x = lines[i++]; acc.push(x); if (x.trim().endsWith("$$")) break; }
      out.push(<Tex key={k} block>{acc.join("\n").trim().replace(/^\$\$|\$\$$/g, "")}</Tex>);
    } else if (t.startsWith("#### ")) {
      i++;
      out.push(<h4 key={k}><Inline text={t.slice(5)} /></h4>);
    } else if (t.startsWith("> ")) {
      const acc = take((x) => x.trim().startsWith("> "));
      out.push(<Callout key={k} kind="tip"><Inline text={acc.map((x) => x.trim().slice(2)).join(" ")} /></Callout>);
    } else if (t.startsWith("|")) {
      const acc = take((x) => x.trim().startsWith("|"));
      const rows = acc.filter((x) => !/^\|\s*-/.test(x.trim())).map((x) => x.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      out.push(
        <div key={k} className="overflow-x-auto">
          <table>
            <thead><tr>{rows[0].map((c, j) => <th key={j}><Inline text={c} /></th>)}</tr></thead>
            <tbody>{rows.slice(1).map((r, m) => <tr key={m}>{r.map((c, j) => <td key={j}><Inline text={c} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    } else if (/^-\s/.test(t)) {
      const acc = take((x) => /^\s*-\s/.test(x));
      out.push(<ul key={k}>{acc.map((x, j) => <li key={j}><Inline text={x.replace(/^\s*-\s/, "")} /></li>)}</ul>);
    } else if (/^\d+\.\s/.test(t)) {
      const acc = take((x) => /^\s*\d+\.\s/.test(x));
      out.push(<ol key={k}>{acc.map((x, j) => <li key={j}><Inline text={x.replace(/^\s*\d+\.\s/, "")} /></li>)}</ol>);
    } else {
      const acc = take((x) => x.trim() !== "" && !/^(\$\$|#### |> |\||-\s|\d+\.\s)/.test(x.trim()));
      out.push(<p key={k}><Inline text={acc.join(" ")} /></p>);
    }
  }
  return <div className={cx("prose-q", className)}>{out}</div>;
}

/* ------------------------------ Layout ------------------------------ */

export function Card({ children, className, title, subtitle, actions, pad = true }: { children: ReactNode; className?: string; title?: ReactNode; subtitle?: ReactNode; actions?: ReactNode; pad?: boolean }) {
  return (
    <section className={cx("rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-2 px-4 pt-4 sm:px-5">
          <div className="min-w-0">
            {title && <h3 className="text-[15px] font-semibold leading-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-1.5 no-print">{actions}</div>}
        </header>
      )}
      <div className={cx(pad && "p-4 sm:p-5", title && pad && "pt-3 sm:pt-3")}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, kicker, actions }: { title: ReactNode; subtitle?: ReactNode; kicker?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {kicker && <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">{kicker}</div>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 no-print">{actions}</div>}
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "outline" | "soft" | "danger";
export function Button({ children, variant = "outline", size = "md", className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-[background,transform,border-color] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 whitespace-nowrap",
        size === "sm" && "h-8 px-2.5 text-[13px]",
        size === "md" && "h-10 px-3.5 text-sm",
        size === "lg" && "h-12 px-5 text-[15px]",
        variant === "primary" && "bg-brand text-white hover:brightness-110 dark:text-[#06201f]",
        variant === "outline" && "border border-line bg-surface hover:bg-surface-2",
        variant === "ghost" && "hover:bg-surface-2",
        variant === "soft" && "bg-brand-soft text-brand hover:brightness-95",
        variant === "danger" && "border border-bad/40 text-bad hover:bg-bad-soft",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "brand" | "ok" | "bad" | "warn"; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tone === "neutral" && "bg-surface-2 text-muted",
        tone === "brand" && "bg-brand-soft text-brand",
        tone === "ok" && "bg-ok-soft text-ok",
        tone === "bad" && "bg-bad-soft text-bad",
        tone === "warn" && "bg-warn-soft text-warn",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Callout({ kind = "info", title, children }: { kind?: "info" | "tip" | "warn" | "ok" | "bad"; title?: ReactNode; children: ReactNode }) {
  const Icon = kind === "tip" ? Lightbulb : Info;
  return (
    <div
      className={cx(
        "my-2 flex gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm",
        kind === "info" && "border-brand/25 bg-brand-soft/60",
        kind === "tip" && "border-warn/25 bg-warn-soft/70",
        kind === "warn" && "border-warn/30 bg-warn-soft",
        kind === "ok" && "border-ok/30 bg-ok-soft",
        kind === "bad" && "border-bad/30 bg-bad-soft"
      )}
    >
      <Icon className={cx("mt-0.5 size-4 shrink-0", kind === "tip" || kind === "warn" ? "text-warn" : kind === "ok" ? "text-ok" : kind === "bad" ? "text-bad" : "text-brand")} />
      <div className="min-w-0 leading-relaxed">
        {title && <div className="font-semibold">{title}</div>}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------ Entradas ------------------------------ */

/** Campo numérico que aceita vírgula e notação científica (1,8e-10). */
export function NumField({ label, value, onChange, unit, hint, step, min, className }: { label: ReactNode; value: number; onChange: (v: number) => void; unit?: ReactNode; hint?: ReactNode; step?: number; min?: number; className?: string }) {
  const id = useId();
  const [raw, setRaw] = useState(() => toRaw(value));
  useEffect(() => {
    if (parseNum(raw) !== value) setRaw(toRaw(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const bad = raw !== "" && !isFinite(parseNum(raw));
  return (
    <label htmlFor={id} className={cx("block min-w-0", className)}>
      <span className="mb-1 block text-[13px] font-medium text-muted">{label}</span>
      <div className={cx("flex h-10 items-center rounded-xl border bg-surface pr-2 focus-within:border-brand", bad ? "border-bad" : "border-line")}>
        <input
          id={id}
          inputMode="decimal"
          className="num h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none"
          value={raw}
          step={step}
          min={min}
          onChange={(e) => {
            setRaw(e.target.value);
            const v = parseNum(e.target.value);
            if (isFinite(v)) onChange(v);
          }}
        />
        {unit && <span className="shrink-0 text-sm text-muted">{unit}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
function toRaw(v: number) {
  if (!isFinite(v)) return "";
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e6)) return Number(v.toPrecision(5)).toExponential().replace(".", ",").replace("e+", "e");
  return String(+v.toPrecision(10)).replace(".", ",");
}

export function Select<T extends string>({ label, value, onChange, options, className }: { label?: ReactNode; value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className={cx("block min-w-0", className)}>
      {label && <span className="mb-1 block text-[13px] font-medium text-muted">{label}</span>}
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="h-10 w-full appearance-none rounded-xl border border-line bg-surface pl-3 pr-8 text-[15px] outline-none focus:border-brand">
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-3 size-4 text-muted" />
      </div>
    </label>
  );
}

export function Slider({ label, value, onChange, min, max, step = 0.01, format }: { label: ReactNode; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; format?: (v: number) => string }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]">
        <span className="font-medium text-muted">{label}</span>
        <span className="num font-semibold">{format ? format(value) : value}</span>
      </div>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string }) {
  return (
    <div role="tablist" className={cx("inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-surface-2 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx("relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors", value === o.value ? "text-ink" : "text-muted hover:text-ink")}
        >
          {value === o.value && <motion.span layoutId={`seg-${options.map((x) => x.value).join("")}`} className="absolute inset-0 rounded-lg bg-surface shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.35 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ Resultados ------------------------------ */

export function Stat({ label, value, unit, sub, tone, big }: { label: ReactNode; value: ReactNode; unit?: ReactNode; sub?: ReactNode; tone?: "ok" | "bad" | "brand"; big?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-2 px-3.5 py-2.5">
      <div className="truncate text-xs font-medium text-muted">{label}</div>
      <div className={cx("num mt-0.5 font-semibold leading-tight", big ? "text-2xl" : "text-lg", tone === "ok" && "text-ok", tone === "bad" && "text-bad", tone === "brand" && "text-brand")}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export interface Step {
  title: string;
  text?: string;
  tex?: string;
  result?: string;
}

/** Resolução passo a passo animada. */
export function Steps({ steps, startOpen = true }: { steps: Step[]; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <div className="rounded-xl border border-line">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-semibold">
        <span>Resolução passo a passo ({steps.length})</span>
        <ChevronDown className={cx("size-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-3.5 pb-3">
            {steps.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative border-l-2 border-brand/30 py-2 pl-5">
                <span className="absolute -left-[11px] top-2 grid size-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white dark:text-[#06201f]">{i + 1}</span>
                <div className="text-sm font-semibold">{s.title}</div>
                {s.text && <div className="mt-0.5 text-sm leading-relaxed text-muted"><Inline text={s.text} /></div>}
                {s.tex && <Tex block>{s.tex}</Tex>}
                {s.result && <div className="mt-1 inline-block rounded-lg bg-brand-soft px-2 py-0.5 text-sm font-semibold text-brand"><Inline text={s.result} /></div>}
              </motion.li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Grid({ children, cols = 2, className }: { children: ReactNode; cols?: 2 | 3 | 4; className?: string }) {
  return <div className={cx("grid gap-3", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-2 lg:grid-cols-3", cols === 4 && "grid-cols-2 lg:grid-cols-4", className)}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{children}</div>;
}

export function Progress({ value, className, tone = "brand" }: { value: number; className?: string; tone?: "brand" | "ok" }) {
  return (
    <div className={cx("h-2 overflow-hidden rounded-full bg-surface-2", className)}>
      <motion.div className={cx("h-full rounded-full", tone === "ok" ? "bg-ok" : "bg-brand")} initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
    </div>
  );
}
