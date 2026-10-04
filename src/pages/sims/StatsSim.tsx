import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Crosshair, RotateCcw, Shuffle } from "lucide-react";
import { fix, linspace, normPdf, Rng, tCrit } from "../../engine/math";
import { describe } from "../../engine/stats";
import { Button, Callout, Card, PageHeader, Segmented, Slider, Stat } from "../../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../../components/charts";

function gauss(r: Rng) {
  const u = Math.max(1e-12, r.next()), v = r.next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const SCENARIOS = [
  { label: "Exato e preciso", bias: 0, spread: 0.08 },
  { label: "Preciso, inexato", bias: 0.45, spread: 0.08 },
  { label: "Exato, impreciso", bias: 0, spread: 0.32 },
  { label: "Inexato e impreciso", bias: 0.4, spread: 0.3 },
];

function Target() {
  const pal = usePalette();
  const [bias, setBias] = useState(0.45);
  const [spread, setSpread] = useState(0.08);
  const [shots, setShots] = useState<{ x: number; y: number; id: number }[]>([]);
  const [rng] = useState(() => new Rng(Date.now()));
  const fire = (n: number) => {
    const fresh = Array.from({ length: n }, (_, i) => ({ x: bias * 0.7 + spread * gauss(rng), y: -bias * 0.7 + spread * gauss(rng), id: Date.now() + i }));
    setShots((s) => [...s, ...fresh].slice(-60));
  };
  const xs = shots.map((s) => Math.hypot(s.x, s.y));
  const cx = shots.length ? shots.reduce((a, s) => a + s.x, 0) / shots.length : 0;
  const cy = shots.length ? shots.reduce((a, s) => a + s.y, 0) / shots.length : 0;
  const sd = shots.length > 1 ? Math.sqrt(shots.reduce((a, s) => a + (s.x - cx) ** 2 + (s.y - cy) ** 2, 0) / (shots.length - 1)) : 0;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <Card pad={false}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" className="mx-auto aspect-square w-full max-w-[460px] p-4">
          {[1, 0.8, 0.6, 0.4, 0.2].map((r, i) => <circle key={r} r={r} fill={i % 2 ? pal.surface : "var(--surface-2)"} stroke={pal.grid} strokeWidth={0.008} />)}
          <circle r={0.06} fill={pal.bad} />
          <line x1={-1.1} x2={1.1} y1={0} y2={0} stroke={pal.grid} strokeWidth={0.006} />
          <line y1={-1.1} y2={1.1} x1={0} x2={0} stroke={pal.grid} strokeWidth={0.006} />
          <AnimatePresence>
            {shots.map((s) => (
              <motion.circle key={s.id} cx={s.x} cy={s.y} r={0.035} fill={pal.brand} stroke={pal.surface} strokeWidth={0.01} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 0.9 }} transition={{ type: "spring", bounce: 0.4 }} />
            ))}
          </AnimatePresence>
          {shots.length > 1 && <motion.circle cx={cx} cy={cy} r={sd} fill="none" stroke={pal.warn} strokeWidth={0.012} strokeDasharray="0.04 0.03" animate={{ cx, cy, r: sd }} />}
          {shots.length > 0 && <motion.path d="M -0.05 0 L 0.05 0 M 0 -0.05 L 0 0.05" stroke={pal.warn} strokeWidth={0.02} animate={{ x: cx, y: cy }} />}
        </svg>
      </Card>
      <Card title="Controles">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-1.5">
            {SCENARIOS.map((s) => <Button key={s.label} size="sm" variant="outline" onClick={() => { setBias(s.bias); setSpread(s.spread); setShots([]); }}>{s.label}</Button>)}
          </div>
          <Slider label="Erro sistemático (viés)" value={bias} onChange={setBias} min={0} max={0.8} step={0.01} format={(v) => fix(v, 2)} />
          <Slider label="Erro aleatório (dispersão σ)" value={spread} onChange={setSpread} min={0.01} max={0.45} step={0.01} format={(v) => fix(v, 2)} />
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => fire(1)}><Crosshair className="size-4" /> 1 medida</Button>
            <Button onClick={() => fire(10)}>+10</Button>
            <Button variant="ghost" onClick={() => setShots([])}><RotateCcw className="size-4" /></Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Distância média ao centro" value={xs.length ? fix(Math.hypot(cx, cy), 3) : "—"} sub="mede a EXATIDÃO" />
            <Stat label="Dispersão (s)" value={xs.length > 1 ? fix(sd, 3) : "—"} sub="mede a PRECISÃO" />
          </div>
          <Callout kind="tip">A cruz laranja é a média das medidas; o círculo tracejado tem raio s. Mais medidas melhoram a estimativa da média, mas <b>não corrigem o viés</b>.</Callout>
        </div>
      </Card>
    </div>
  );
}

function Normal() {
  const pal = usePalette();
  const [k, setK] = useState(2);
  const [df, setDf] = useState(4);
  const data = useMemo(
    () => linspace(-4.5, 4.5, 241).map((z) => {
      const tpdf = Math.exp(lgam((df + 1) / 2) - lgam(df / 2)) / Math.sqrt(df * Math.PI) * (1 + (z * z) / df) ** (-(df + 1) / 2);
      return { z: +z.toFixed(3), normal: normPdf(z), t: tpdf, area: Math.abs(z) <= k ? normPdf(z) : 0 };
    }),
    [k, df]
  );
  const pct = { 1: 68.27, 2: 95.45, 3: 99.73 }[k as 1 | 2 | 3] ?? NaN;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <ChartCard title="Distribuição normal × t de Student" data={data} csvName="normal-t" height={340}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis dataKey="z" type="number" domain={[-4.5, 4.5]} ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]} {...axisProps(pal)} label={{ value: "z = (x − μ)/σ", position: "insideBottom", offset: -6, fill: pal.muted, fontSize: 12 }} />
            <YAxis {...axisProps(pal)} width={40} tickFormatter={(v) => fix(v, 1)} />
            <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 4)} />
            <Area dataKey="area" fill={pal.brand} fillOpacity={0.25} stroke="none" isAnimationActive={false} />
            <Line dataKey="normal" stroke={pal.brand} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line dataKey="t" stroke={pal.warn} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            <ReferenceLine x={-k} stroke={pal.brand} /><ReferenceLine x={k} stroke={pal.brand} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
      <Card title="Explore">
        <div className="space-y-3">
          <Segmented value={String(k) as "1" | "2" | "3"} onChange={(v) => setK(Number(v))} options={[{ value: "1", label: "±1σ" }, { value: "2", label: "±2σ" }, { value: "3", label: "±3σ" }]} />
          <Stat label={`Área em μ ± ${k}σ`} value={fix(pct, 2)} unit="%" tone="brand" />
          <Slider label="Graus de liberdade da t" value={df} onChange={setDf} min={1} max={30} step={1} />
          <Stat label="t crítico (95 %, bilateral)" value={fix(tCrit(0.95, df), 3)} sub="z = 1,960 para infinitos GL" />
          <Callout kind="info">A t (tracejada) tem caudas mais pesadas: com poucas réplicas, s é uma estimativa incerta de σ, e o intervalo precisa ser mais largo.</Callout>
        </div>
      </Card>
    </div>
  );
}
function lgam(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, s = 1.000000000190015;
  const t = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  for (const v of c) s += v / ++y;
  return -t + Math.log((2.5066282746310005 * s) / x);
}

function Coverage() {
  const pal = usePalette();
  const [n, setN] = useState(4);
  const [conf, setConf] = useState(0.95);
  const [seed, setSeed] = useState(1);
  const mu = 50, sigma = 2;
  const intervals = useMemo(() => {
    const r = new Rng(seed * 9973 + n);
    const t = tCrit(conf, n - 1);
    return Array.from({ length: 40 }, (_, i) => {
      const xs = Array.from({ length: n }, () => mu + sigma * gauss(r));
      const d = describe(xs);
      const h = (t * d.s) / Math.sqrt(n);
      return { i, lo: d.mean - h, hi: d.mean + h, mean: d.mean, hit: d.mean - h <= mu && mu <= d.mean + h };
    });
  }, [n, conf, seed]);
  const hits = intervals.filter((x) => x.hit).length;
  const xmin = 50 - 8, xmax = 50 + 8;
  const X = (v: number) => 30 + ((Math.min(xmax, Math.max(xmin, v)) - xmin) / (xmax - xmin)) * 560;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Card title="40 amostras, 40 intervalos de confiança" subtitle={`μ verdadeiro = 50 (linha vertical). Vermelhos não contêm μ.`}>
        <svg viewBox="0 0 620 440" className="w-full">
          <line x1={X(mu)} x2={X(mu)} y1={5} y2={420} stroke={pal.ink} strokeWidth={1.5} />
          {[42, 46, 50, 54, 58].map((v) => <text key={v} x={X(v)} y={436} textAnchor="middle" fontSize="11" fill={pal.muted}>{v}</text>)}
          {intervals.map((iv, k) => (
            <motion.g key={`${seed}-${n}-${conf}-${k}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.025 }}>
              <line x1={X(iv.lo)} x2={X(iv.hi)} y1={10 + k * 10.2} y2={10 + k * 10.2} stroke={iv.hit ? pal.brand : pal.bad} strokeWidth={2.4} strokeLinecap="round" />
              <circle cx={X(iv.mean)} cy={10 + k * 10.2} r={2.6} fill={iv.hit ? pal.brand : pal.bad} />
            </motion.g>
          ))}
        </svg>
      </Card>
      <Card title="Parâmetros">
        <div className="space-y-3">
          <Slider label="Réplicas por amostra (n)" value={n} onChange={setN} min={2} max={20} step={1} />
          <Segmented value={String(conf) as "0.9" | "0.95" | "0.99"} onChange={(v) => setConf(Number(v))} options={[{ value: "0.9", label: "90 %" }, { value: "0.95", label: "95 %" }, { value: "0.99", label: "99 %" }]} />
          <Stat label="Intervalos que contêm μ" value={`${hits}/40`} sub={`${fix((100 * hits) / 40, 0)} % (esperado ≈ ${fix(conf * 100, 0)} %)`} tone="brand" />
          <Button variant="primary" onClick={() => setSeed(seed + 1)}><Shuffle className="size-4" /> Novas amostras</Button>
          <Callout kind="info">Aumentar n estreita os intervalos, mas a fração que contém μ continua ≈ nível de confiança. É isso que “95 % de confiança” significa.</Callout>
        </div>
      </Card>
    </div>
  );
}

export default function StatsSim() {
  const [tab, setTab] = useState<"alvo" | "normal" | "ic">("alvo");
  return (
    <div className="space-y-5">
      <PageHeader kicker="Simulador · Estatística" title="Estatística visual" subtitle="Exatidão × precisão no alvo, a distribuição normal e o que um intervalo de confiança realmente significa." />
      <Segmented value={tab} onChange={setTab} options={[{ value: "alvo", label: "Exatidão × precisão" }, { value: "normal", label: "Normal e t" }, { value: "ic", label: "Intervalos de confiança" }]} />
      {tab === "alvo" && <Target />}
      {tab === "normal" && <Normal />}
      {tab === "ic" && <Coverage />}
    </div>
  );
}
