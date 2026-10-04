import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Pause, Play } from "lucide-react";
import { alphas, bufferCapacity, WEAK_LIBRARY } from "../../engine/acidbase";
import { EDTA_PKA } from "../../engine/equilibria";
import { fix, fmt, linspace } from "../../engine/math";
import { Button, Card, PageHeader, Select, Slider } from "../../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../../components/charts";

const SYSTEMS = [
  ...WEAK_LIBRARY.filter((w) => w.kind === "ácido" || w.pKa.length > 1).map((w) => ({ id: w.id, name: w.name, pKa: w.pKa, z: w.z })),
  { id: "edta", name: "EDTA (H₆Y²⁺ … Y⁴⁻)", pKa: EDTA_PKA, z: 2 },
];

function speciesNames(n: number, z: number, id: string) {
  if (id === "edta") return ["H₆Y²⁺", "H₅Y⁺", "H₄Y", "H₃Y⁻", "H₂Y²⁻", "HY³⁻", "Y⁴⁻"];
  const sup = (c: number) => (c === 0 ? "" : c === 1 ? "⁺" : c === -1 ? "⁻" : c > 0 ? `${"⁰¹²³⁴⁵⁶"[c]}⁺` : `${"⁰¹²³⁴⁵⁶"[-c]}⁻`);
  const sub = (k: number) => (k === 0 ? "" : k === 1 ? "H" : `H${"₀₁₂₃₄₅₆"[k]}`);
  return Array.from({ length: n + 1 }, (_, j) => `${sub(n - j)}A${sup(z - j)}`);
}

export default function SpeciesSim() {
  const pal = usePalette();
  const [sysId, setSysId] = useState("phosphoric");
  const [pH, setPH] = useState(7);
  const [playing, setPlaying] = useState(false);
  const sys = SYSTEMS.find((s) => s.id === sysId)!;
  const names = speciesNames(sys.pKa.length, sys.z, sys.id);

  const data = useMemo(
    () =>
      linspace(0, 14, 281).map((p) => {
        const a = alphas(sys.pKa, 10 ** -p);
        const row: Record<string, number> = { pH: +p.toFixed(2) };
        names.forEach((n, j) => (row[n] = +a[j].toFixed(5)));
        row["β (C=0,1 M)"] = sys.pKa.reduce((s, k) => s + bufferCapacity(0.1, k, p) - 2.303 * (10 ** -p + 10 ** (p - 14)), 2.303 * (10 ** -p + 10 ** (p - 14)));
        return row;
      }),
    [sysId] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const now = alphas(sys.pKa, 10 ** -pH);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPH((p) => (p >= 14 ? 0 : +(p + 0.05).toFixed(2))), 40);
    return () => clearInterval(id);
  }, [playing]);

  const dominant = now.indexOf(Math.max(...now));

  return (
    <div className="space-y-5">
      <PageHeader kicker="Simulador · Equilíbrio" title="Distribuição de espécies (α × pH)" subtitle="Arraste o pH ou aperte play para ver as frações de cada espécie mudarem. Nos pontos pH = pKa duas espécies vizinhas se igualam." />
      <Card>
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <Select label="Sistema" value={sysId} onChange={setSysId} options={SYSTEMS.map((s) => ({ value: s.id, label: `${s.name} (pKa ${s.pKa.map((k) => fix(k, 2)).join("; ")})` }))} />
          <Slider label="pH" value={pH} onChange={setPH} min={0} max={14} step={0.01} format={(v) => fix(v, 2)} />
          <Button variant={playing ? "danger" : "primary"} onClick={() => setPlaying(!playing)}>{playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Pausar" : "Animar"}</Button>
        </div>
        <div className="mt-4 space-y-2">
          {names.map((n, j) => (
            <div key={n} className="flex items-center gap-3">
              <div className="w-16 shrink-0 text-right font-mono text-sm">{n}</div>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-surface-2">
                <motion.div className="flex h-full items-center justify-end rounded-lg pr-2 text-[11px] font-semibold text-white" style={{ background: pal.series[j % pal.series.length] }} animate={{ width: `${Math.max(0.5, now[j] * 100)}%` }} transition={{ duration: 0.15 }}>
                  {now[j] > 0.08 ? fix(100 * now[j], 1) + " %" : ""}
                </motion.div>
              </div>
              <div className="num w-20 shrink-0 text-right text-xs text-muted">{fmt(now[j], 3)}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">Em pH {fix(pH, 2)}, a espécie predominante é <b className="text-ink">{names[dominant]}</b>.</p>
      </Card>

      <ChartCard title="Diagrama de frações" data={data} csvName={`especies-${sysId}`} height={340}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis dataKey="pH" type="number" domain={[0, 14]} ticks={[0, 2, 4, 6, 8, 10, 12, 14]} {...axisProps(pal)} />
            <YAxis domain={[0, 1]} {...axisProps(pal)} width={36} />
            <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 3)} labelFormatter={(v) => `pH ${fix(Number(v), 2)}`} />
            {sys.pKa.map((k) => <ReferenceLine key={k} x={k} stroke={pal.muted} strokeDasharray="3 4" />)}
            <ReferenceLine x={pH} stroke={pal.ink} strokeWidth={1.5} />
            {names.map((n, j) => <Area key={n} dataKey={n} type="monotone" stroke={pal.series[j % pal.series.length]} fill={pal.series[j % pal.series.length]} fillOpacity={0.18} strokeWidth={2} isAnimationActive={false} />)}
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Capacidade tamponante β (c = 0,1 M)" subtitle="Máximos em pH = pKa; mínimos entre eles" data={data.map((d) => ({ pH: d.pH, beta: d["β (C=0,1 M)"] }))} csvName="capacidade-tamponante" height={260}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis dataKey="pH" type="number" domain={[0, 14]} ticks={[0, 2, 4, 6, 8, 10, 12, 14]} {...axisProps(pal)} />
            <YAxis {...axisProps(pal)} width={44} domain={[0, 0.2]} allowDataOverflow />
            <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 4)} />
            <ReferenceLine x={pH} stroke={pal.ink} />
            <Line dataKey="β (C=0,1 M)" stroke={pal.brand} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
