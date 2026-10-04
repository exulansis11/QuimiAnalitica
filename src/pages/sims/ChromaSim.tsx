import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Pause, Play, RotateCcw } from "lucide-react";
import { chromatogram, purnell, resolution, uOptimum, vanDeemter, type Peak } from "../../engine/instrumental";
import { fix, linspace } from "../../engine/math";
import { Button, Callout, Card, PageHeader, Segmented, Slider, Stat } from "../../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../../components/charts";

function Column({ t, peaks, tM }: { t: number; peaks: Peak[]; tM: number }) {
  const L = 520, x0 = 60, y = 50;
  return (
    <svg viewBox="0 0 680 110" className="w-full" role="img" aria-label="Coluna cromatográfica com bandas migrando">
      <rect x="8" y={y - 16} width="46" height="32" rx="6" fill="var(--surface-2)" stroke="var(--line)" />
      <text x="31" y={y + 4} textAnchor="middle" fontSize="10" fill="var(--muted)">Injetor</text>
      <rect x={x0} y={y - 12} width={L} height="24" rx="12" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="1.2" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={x0 + 8 + i * 13} cy={y + ((i * 7) % 11) - 5} r="2" fill="var(--muted)" opacity="0.25" />)}
      {peaks.map((p) => {
        const frac = t / p.tR; // fração da coluna percorrida
        if (frac <= 0 || frac > 1.08) return null;
        const cx = x0 + L * Math.min(frac, 1.08);
        const sigmaX = (L * p.sigma) / p.tR * Math.sqrt(Math.max(frac, 0.02)) * 1.2;
        return (
          <g key={p.name}>
            <ellipse cx={cx} cy={y} rx={Math.max(3, 2.2 * sigmaX)} ry="10" fill={p.color} opacity={frac > 1 ? 0.25 : 0.75} />
          </g>
        );
      })}
      {/* front do solvente (tM) */}
      {t < tM * 1.05 && <line x1={x0 + (L * t) / tM} x2={x0 + (L * t) / tM} y1={y - 12} y2={y + 12} stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 3" />}
      <rect x={x0 + L + 4} y={y - 18} width="80" height="36" rx="6" fill="#16201d" />
      <text x={x0 + L + 44} y={y + 4} textAnchor="middle" fontSize="11" fill="#7ff5b8">Detector</text>
      <text x={x0 + L / 2} y={y + 36} textAnchor="middle" fontSize="11" fill="var(--muted)">Coluna (fase estacionária) — fluxo →</text>
    </svg>
  );
}

function RunSim() {
  const pal = usePalette();
  const [N, setN] = useState(4000);
  const [k1, setK1] = useState(2);
  const [alpha, setAlpha] = useState(1.12);
  const [tM, setTM] = useState(1);
  const [third, setThird] = useState(true);
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef(0);

  const k2 = alpha * k1, k3 = 2.2 * k1;
  const peaks: Peak[] = useMemo(() => {
    const mk = (name: string, k: number, area: number, color: string): Peak => {
      const tR = tM * (1 + k);
      return { name, tR, sigma: tR / Math.sqrt(N), area, color };
    };
    const list = [mk("A", k1, 1, pal.series[0]), mk("B", k2, 0.8, pal.series[1])];
    if (third) list.push(mk("C", k3, 1.2, pal.series[2]));
    return list;
  }, [N, k1, k2, k3, tM, third, pal]);
  const tMax = Math.max(...peaks.map((p) => p.tR + 5 * p.sigma)) * 1.05;
  const trace = useMemo(() => chromatogram(peaks, tMax, 700, 0.004, 7), [peaks, tMax]);
  const shown = trace.filter((p) => p.t <= t);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((x) => {
        const nx = x + (dt * tMax) / 8; // corrida em ~8 s
        if (nx >= tMax) {
          setRunning(false);
          return tMax;
        }
        return nx;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running, tMax]);

  useEffect(() => {
    setT(0);
  }, [N, k1, alpha, tM, third]);

  const w = (p: Peak) => 4 * p.sigma;
  const Rs12 = resolution(peaks[0].tR, peaks[1].tR, w(peaks[0]), w(peaks[1]));
  const Rsp = purnell(N, alpha, k2);
  const Nreq = 16 * 1.5 ** 2 * (alpha / (alpha - 1)) ** 2 * ((1 + k2) / k2) ** 2;

  return (
    <div className="space-y-5">
      <Card pad={false}>
        <div className="p-3 sm:p-5"><Column t={t} peaks={peaks} tM={tM} /></div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
          <Button variant={running ? "danger" : "primary"} onClick={() => { if (t >= tMax) setT(0); setRunning(!running); }}>{running ? <Pause className="size-4" /> : <Play className="size-4" />} {running ? "Pausar" : "Injetar e correr"}</Button>
          <Button variant="ghost" onClick={() => { setRunning(false); setT(0); }}><RotateCcw className="size-4" /> Reiniciar</Button>
          <span className="num ml-auto text-sm text-muted">t = {fix(t, 2)} min</span>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card title="Condições">
          <div className="space-y-3">
            <Slider label="Número de pratos N" value={N} onChange={setN} min={200} max={30000} step={100} format={(v) => Math.round(v).toLocaleString("pt-BR")} />
            <Slider label="k do 1º composto" value={k1} onChange={setK1} min={0.3} max={10} step={0.1} format={(v) => fix(v, 1)} />
            <Slider label="Seletividade α (B/A)" value={alpha} onChange={setAlpha} min={1.01} max={1.6} step={0.01} format={(v) => fix(v, 2)} />
            <Slider label="Tempo morto tM" value={tM} onChange={setTM} min={0.5} max={3} step={0.1} format={(v) => `${fix(v, 1)} min`} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={third} onChange={(e) => setThird(e.target.checked)} /> Incluir 3º composto (C)</label>
          </div>
        </Card>
        <div className="min-w-0 space-y-5">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Stat label="Rs (A/B)" value={fix(Rs12, 2)} tone={Rs12 >= 1.5 ? "ok" : "bad"} sub={Rs12 >= 1.5 ? "linha de base" : "sobreposição"} />
            <Stat label="Rs por Purnell" value={fix(Rsp, 2)} />
            <Stat label="tR A / B" value={`${fix(peaks[0].tR, 2)} / ${fix(peaks[1].tR, 2)}`} unit="min" />
            <Stat label="N necessário p/ Rs 1,5" value={Math.round(Nreq).toLocaleString("pt-BR")} />
          </div>
          <ChartCard title="Cromatograma" subtitle="O sinal é desenhado em tempo real conforme os compostos chegam ao detector" data={trace.map((p) => ({ "t (min)": +p.t.toFixed(4), sinal: +p.y.toFixed(5) }))} csvName="cromatograma" height={300}>
            <ResponsiveContainer>
              <AreaChart data={shown.length > 1 ? shown : [{ t: 0, y: 0 }]} margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
                <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
                <XAxis dataKey="t" type="number" domain={[0, tMax]} {...axisProps(pal)} tickFormatter={(v) => fix(v, 1)} label={{ value: "tempo (min)", position: "insideBottom", offset: -6, fill: pal.muted, fontSize: 12 }} />
                <YAxis {...axisProps(pal)} width={40} domain={[0, Math.max(...trace.map((p) => p.y)) * 1.1]} tickFormatter={(v) => fix(v, 1)} />
                <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 3)} labelFormatter={(v) => `${fix(Number(v), 2)} min`} />
                <ReferenceLine x={tM} stroke={pal.muted} strokeDasharray="3 3" label={{ value: "tM", fill: pal.muted, fontSize: 11, position: "top" }} />
                <Area dataKey="y" stroke={pal.brand} fill={pal.brand} fillOpacity={0.15} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <Callout kind="tip">Experimente: dobrar N aumenta Rs só √2 vezes, enquanto mudar α de 1,05 para 1,10 quase dobra Rs. Esse é o argumento da equação de Purnell.</Callout>
        </div>
      </div>
    </div>
  );
}

function VanDeemter() {
  const pal = usePalette();
  const [A, setA] = useState(0.02);
  const [B, setB] = useState(0.5);
  const [C, setC] = useState(0.03);
  const uo = uOptimum(B, C);
  const data = useMemo(() => linspace(0.5, 15, 120).map((u) => ({ u: +u.toFixed(3), H: vanDeemter(A, B, C, u), A, "B/u": B / u, "C·u": C * u })), [A, B, C]);
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card title="Termos da equação">
        <div className="space-y-3">
          <Slider label="A (caminhos múltiplos)" value={A} onChange={setA} min={0} max={0.1} step={0.002} format={(v) => fix(v, 3)} />
          <Slider label="B (difusão longitudinal)" value={B} onChange={setB} min={0.05} max={2} step={0.05} format={(v) => fix(v, 2)} />
          <Slider label="C (transferência de massa)" value={C} onChange={setC} min={0.002} max={0.1} step={0.002} format={(v) => fix(v, 3)} />
          <Stat label="u ótima = √(B/C)" value={fix(uo, 2)} unit="cm/s" tone="brand" />
          <Stat label="H mínima" value={fix(vanDeemter(A, B, C, uo), 4)} unit="cm" />
        </div>
      </Card>
      <ChartCard title="Curva de van Deemter" subtitle="H = A + B/u + C·u" data={data} csvName="van-deemter" height={340}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 12, left: 4 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis dataKey="u" type="number" domain={[0, 15]} {...axisProps(pal)} label={{ value: "velocidade linear u (cm/s)", position: "insideBottom", offset: -6, fill: pal.muted, fontSize: 12 }} />
            <YAxis {...axisProps(pal)} width={48} domain={[0, "auto"]} tickFormatter={(v) => fix(v, 2)} />
            <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 4)} />
            <Line dataKey="H" stroke={pal.brand} strokeWidth={2.6} dot={false} isAnimationActive={false} />
            <Line dataKey="B/u" stroke={pal.series[1]} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
            <Line dataKey="C·u" stroke={pal.series[2]} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
            <Line dataKey="A" stroke={pal.series[3]} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
            <ReferenceDot x={+uo.toFixed(3)} y={vanDeemter(A, B, C, uo)} r={6} fill={pal.warn} stroke="none" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export default function ChromaSim() {
  const [tab, setTab] = useState<"run" | "vd">("run");
  return (
    <div className="space-y-5">
      <PageHeader kicker="Simulador · Cromatografia" title="Cromatógrafo animado" subtitle="Veja as bandas migrarem e alargarem na coluna enquanto o detector desenha o cromatograma. Ajuste N, k e α e observe a resolução." />
      <Segmented value={tab} onChange={setTab} options={[{ value: "run", label: "Corrida cromatográfica" }, { value: "vd", label: "Equação de van Deemter" }]} />
      {tab === "run" ? <RunSim /> : <VanDeemter />}
    </div>
  );
}
