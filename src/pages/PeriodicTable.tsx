import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_LABELS, ELEMENTS, type Element, type ElementCategory } from "../data/elements";
import { molarMass, prettyFormula } from "../engine/stoich";
import { Button, Card, PageHeader, Stat, cx } from "../components/ui";
import { fix } from "../engine/math";

export default function PeriodicTable() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Element | null>(null);
  const [cat, setCat] = useState<ElementCategory | null>(null);
  const [formula, setFormula] = useState("");
  const match = (e: Element) => {
    const s = q.trim().toLowerCase();
    if (cat && e.category !== cat) return false;
    if (!s) return true;
    return e.symbol.toLowerCase() === s || e.name.toLowerCase().includes(s) || e.nameEn.toLowerCase().includes(s) || String(e.z) === s;
  };
  let mmRes: ReturnType<typeof molarMass> | null = null;
  try { if (formula) mmRes = molarMass(formula); } catch { /* fórmula incompleta */ }
  const add = (sym: string) => setFormula((f) => {
    const m = f.match(new RegExp(`${sym}(\\d*)$`));
    if (m) return f.slice(0, f.length - m[0].length) + sym + String((Number(m[1]) || 1) + 1);
    return f + sym;
  });
  return (
    <div className="space-y-5">
      <PageHeader kicker="Ferramentas" title="Tabela periódica interativa" subtitle="Clique num elemento para ver detalhes; use “+” para montar fórmulas e obter a massa molar." />
      <Card pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-3 size-4 text-muted" />
            <input className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3" placeholder="Buscar por nome, símbolo ou Z" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(CATEGORY_LABELS) as ElementCategory[]).filter((c) => c !== "unknown").map((c) => (
              <button key={c} onClick={() => setCat(cat === c ? null : c)} className={cx("rounded-full border px-2 py-0.5 text-[11px] text-[#222]", cat === c ? "border-ink" : "border-transparent")} style={{ background: CATEGORY_COLORS[c] }}>{CATEGORY_LABELS[c]}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto p-3">
          <div className="grid min-w-[860px] gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(10, auto)" }}>
            {ELEMENTS.map((e) => {
              const on = match(e);
              return (
                <motion.button
                  key={e.z}
                  whileHover={{ scale: 1.12, zIndex: 10 }}
                  onClick={() => setSel(e)}
                  className={cx("relative aspect-square rounded-md p-1 text-left text-[#1d1d1d] shadow-sm transition-opacity", !on && "opacity-20")}
                  style={{ gridColumn: e.x, gridRow: e.y >= 9 ? e.y + 0 : e.y, background: CATEGORY_COLORS[e.category], marginTop: e.y >= 9 ? 8 : 0 }}
                  title={e.name}
                >
                  <div className="text-[9px] leading-none opacity-70">{e.z}</div>
                  <div className="text-center text-[15px] font-bold leading-tight">{e.symbol}</div>
                  <div className="truncate text-center text-[8px] leading-none opacity-75">{fix(e.atomicMass, e.atomicMass > 200 ? 0 : 2)}</div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Montador de fórmula">
          <div className="flex gap-2">
            <input className="h-10 flex-1 rounded-xl border border-line bg-surface px-3 font-mono" value={formula} onChange={(e) => setFormula(e.target.value)} placeholder="Clique nos elementos ou digite" />
            <Button variant="ghost" onClick={() => setFormula("")}>Limpar</Button>
          </div>
          {mmRes && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Stat label={prettyFormula(formula)} value={fix(mmRes.total, 3)} unit="g/mol" tone="brand" big />
              <div className="space-y-1 text-sm">{mmRes.rows.map((r) => <div key={r.symbol} className="flex justify-between"><span>{r.symbol} × {r.count}</span><span className="num text-muted">{fix(r.pct, 2)} %</span></div>)}</div>
            </div>
          )}
        </Card>
        <AnimatePresence mode="wait">
          {sel ? (
            <motion.div key={sel.z} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card title={`${sel.name} (${sel.symbol})`} subtitle={`${CATEGORY_LABELS[sel.category]} · Z = ${sel.z}`} actions={<><Button size="sm" variant="soft" onClick={() => add(sel.symbol)}>+ à fórmula</Button><Button size="sm" variant="ghost" onClick={() => setSel(null)}><X className="size-4" /></Button></>}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <Stat label="Massa atômica" value={fix(sel.atomicMass, 3)} unit="u" />
                  <Stat label="Configuração" value={<span className="text-sm">{sel.electronConfig}</span>} />
                  <Stat label="Nox comuns" value={sel.commonOxidation} />
                  {sel.density !== undefined && <Stat label="Densidade" value={fix(sel.density, 3)} unit="g/cm³" />}
                  {sel.meltPoint !== undefined && <Stat label="Fusão" value={Math.round(sel.meltPoint - 273.15)} unit="°C" />}
                  {sel.boilPoint !== undefined && <Stat label="Ebulição" value={Math.round(sel.boilPoint - 273.15)} unit="°C" />}
                </div>
                {sel.discoveredBy && <p className="mt-2 text-sm text-muted">Descoberta: {sel.discoveredBy}</p>}
              </Card>
            </motion.div>
          ) : (
            <Card title="Detalhes"><p className="text-sm text-muted">Selecione um elemento.</p></Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
