import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { FlaskConical, Plus, Trash2 } from "lucide-react";
import { CHROMOPHORES, epsilonAt, lambdaMax, spectrum, wavelengthToRGB } from "../../engine/instrumental";
import { fix, fmt, Rng } from "../../engine/math";
import { inversePredict, linreg, lodLoq } from "../../engine/stats";
import { Badge, Button, Callout, Card, NumField, PageHeader, Select, Slider, Stat } from "../../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../../components/charts";

function Instrument({ lambda, A, solColor }: { lambda: number; A: number; solColor: string }) {
  const beam = wavelengthToRGB(lambda);
  const T = Math.pow(10, -Math.min(A, 4));
  return (
    <svg viewBox="0 0 640 190" className="w-full" role="img" aria-label="Esquema de um espectrofotômetro">
      <defs>
        <linearGradient id="spec" x1="0" x2="1">
          {[380, 430, 480, 530, 580, 630, 700].map((l, i) => <stop key={l} offset={i / 6} stopColor={wavelengthToRGB(l)} />)}
        </linearGradient>
      </defs>
      {/* fonte */}
      <rect x="10" y="70" width="64" height="50" rx="8" fill="var(--surface-2)" stroke="var(--line)" />
      <motion.circle cx="42" cy="95" r="13" fill="#fff3b0" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 1.4 }} />
      <text x="42" y="138" textAnchor="middle" fontSize="11" fill="var(--muted)">Fonte</text>
      <path d="M74 95 L150 95" stroke="#fff6c8" strokeWidth="6" opacity="0.9" />
      {/* monocromador */}
      <path d="M150 125 L185 60 L220 125 Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" opacity="0.9" />
      <path d="M205 100 L250 70 L250 130 Z" fill="url(#spec)" opacity="0.7" />
      <text x="190" y="148" textAnchor="middle" fontSize="11" fill="var(--muted)">Monocromador</text>
      <rect x="255" y="60" width="6" height="28" fill="var(--ink)" />
      <rect x="255" y="102" width="6" height="28" fill="var(--ink)" />
      {/* feixe monocromático */}
      <motion.line x1="261" y1="95" x2="370" y2="95" stroke={beam} strokeWidth="6" strokeDasharray="10 8" animate={{ strokeDashoffset: [0, -36] }} transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }} />
      <text x="315" y="82" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--ink)">{Math.round(lambda)} nm</text>
      {/* cubeta */}
      <rect x="370" y="55" width="50" height="80" rx="3" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
      <motion.rect x="373" y="68" width="44" height="64" rx="2" animate={{ fill: solColor }} transition={{ duration: 0.4 }} />
      <text x="395" y="152" textAnchor="middle" fontSize="11" fill="var(--muted)">Cubeta (b)</text>
      {/* feixe transmitido */}
      <motion.line x1="420" y1="95" x2="520" y2="95" stroke={beam} strokeWidth="6" strokeDasharray="10 8" animate={{ strokeDashoffset: [0, -36], opacity: Math.max(0.06, T) }} transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }} />
      <text x="470" y="82" textAnchor="middle" fontSize="11" fill="var(--muted)">P = P₀·10⁻ᴬ</text>
      {/* detector */}
      <rect x="520" y="62" width="110" height="66" rx="8" fill="#16201d" />
      <text x="575" y="88" textAnchor="middle" fontSize="11" fill="#9bb">A</text>
      <text x="575" y="110" textAnchor="middle" fontSize="20" fontFamily="var(--font-mono)" fill="#7ff5b8">{fix(A, 3)}</text>
      <text x="575" y="145" textAnchor="middle" fontSize="11" fill="var(--muted)">Detector · %T = {fix(100 * T, 1)}</text>
    </svg>
  );
}

export default function SpectroSim() {
  const pal = usePalette();
  const [chId, setChId] = useState("kmno4");
  const ch = CHROMOPHORES.find((c) => c.id === chId)!;
  const lmax = lambdaMax(ch);
  const defaultC = 0.5 / lmax.eps;
  const [c, setC] = useState(defaultC);
  const [b, setB] = useState(1);
  const [lambda, setLambda] = useState(lmax.lambda);
  const [stds, setStds] = useState<{ c: number; A: number }[]>([]);
  const [unknown, setUnknown] = useState<{ A: number; real: number } | null>(null);
  const [noise, setNoise] = useState(0.004);

  const changeCh = (id: string) => {
    const n = CHROMOPHORES.find((x) => x.id === id)!;
    const lm = lambdaMax(n);
    setChId(id);
    setLambda(lm.lambda);
    setC(0.5 / lm.eps);
    setStds([]);
    setUnknown(null);
  };

  const eps = epsilonAt(ch, lambda);
  const A = eps * b * c;
  const intensity = Math.min(1, (lmax.eps * b * c) / 1.2);
  const solColor = `color-mix(in srgb, ${ch.color} ${Math.round(8 + 85 * intensity)}%, transparent)`;
  const spec = useMemo(() => spectrum(ch, c, b).map((p) => ({ lambda: p.lambda, A: +p.A.toFixed(4) })), [ch, c, b]);
  const rng = useMemo(() => new Rng(Date.now()), []);

  const addStd = () => setStds((s) => [...s, { c, A: Math.max(0, A + noise * (rng.next() * 2 - 1)) }].sort((x, y) => x.c - y.c));
  const autoStds = () => {
    const base = 0.9 / (eps * b);
    setStds([0, 0.2, 0.4, 0.6, 0.8, 1.0].map((f) => ({ c: f * base, A: Math.max(0, f * base * eps * b + noise * (rng.next() * 2 - 1)) })));
  };
  const reg = stds.length >= 3 ? linreg(stds.map((s) => s.c), stds.map((s) => s.A)) : null;
  const scale = stds.length ? 10 ** Math.floor(Math.log10(Math.max(...stds.map((s) => s.c)) || 1e-6)) : 1;
  const calData = stds.map((s) => ({ x: s.c / scale, A: s.A, fit: reg ? reg.predict(s.c) : undefined }));
  const pred = reg && unknown ? inversePredict(reg, unknown.A) : null;

  return (
    <div className="space-y-5">
      <PageHeader kicker="Simulador · Espectrofotometria" title="Espectrofotômetro virtual" subtitle="Escolha o cromóforo, ajuste λ, concentração e caminho óptico. Monte uma curva analítica com ruído realista e determine uma amostra desconhecida." />
      <Card pad={false}>
        <div className="p-3 sm:p-5"><Instrument lambda={lambda} A={A} solColor={solColor} /></div>
        <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Cromóforo" value={chId} onChange={changeCh} options={CHROMOPHORES.map((x) => ({ value: x.id, label: x.name }))} />
          <Slider label="Comprimento de onda" value={lambda} onChange={setLambda} min={350} max={750} step={1} format={(v) => `${Math.round(v)} nm`} />
          <NumField label="Concentração" value={c} onChange={setC} unit="mol/L" />
          <Slider label="Caminho óptico b" value={b} onChange={setB} min={0.1} max={5} step={0.1} format={(v) => `${fix(v, 1)} cm`} />
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pb-4 lg:grid-cols-4">
          <Stat label="ε no λ escolhido" value={fmt(eps, 4)} unit="L mol⁻¹ cm⁻¹" />
          <Stat label="Absorbância" value={fix(A, 3)} tone={A > 1.2 || A < 0.1 ? "bad" : "ok"} sub={A > 1.2 ? "acima da faixa ótima" : A < 0.1 ? "abaixo da faixa ótima" : "faixa ótima (0,1–1,2)"} />
          <Stat label="%T" value={fix(100 * 10 ** -A, 1)} unit="%" />
          <Stat label="λmáx" value={lmax.lambda} unit="nm" sub={<button className="text-brand underline" onClick={() => setLambda(lmax.lambda)}>ir para λmáx</button>} />
        </div>
      </Card>

      <ChartCard title="Espectro de absorção" subtitle={`${ch.name}, c = ${fmt(c)} mol/L, b = ${fix(b, 1)} cm`} data={spec} csvName={`espectro-${chId}`} height={280}>
        <ResponsiveContainer>
          <LineChart data={spec} margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
            <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
            <XAxis dataKey="lambda" type="number" domain={[350, 750]} {...axisProps(pal)} label={{ value: "λ (nm)", position: "insideBottom", offset: -6, fill: pal.muted, fontSize: 12 }} />
            <YAxis {...axisProps(pal)} width={44} />
            <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 4)} labelFormatter={(v) => `${v} nm`} />
            <ReferenceLine x={lambda} stroke={wavelengthToRGB(lambda)} strokeWidth={3} />
            <Line dataKey="A" stroke={ch.color} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <ChartCard
          title="Curva analítica"
          subtitle={reg ? `A = ${fmt(reg.slope, 4)}·c + ${fmt(reg.intercept, 3)}   (R² = ${fix(reg.r2, 5)})` : "Adicione ao menos 3 padrões"}
          data={stds.map((s) => ({ "c (mol/L)": s.c, A: +s.A.toFixed(4) }))}
          csvName="curva-analitica"
          height={300}
        >
          <ResponsiveContainer>
            <ComposedChart data={calData} margin={{ top: 8, right: 16, bottom: 12, left: 0 }}>
              <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={[0, "auto"]} {...axisProps(pal)} tickFormatter={(v) => fmt(v, 3)} label={{ value: `c (× ${fmt(scale)} mol/L)`, position: "insideBottom", offset: -6, fill: pal.muted, fontSize: 12 }} />
              <YAxis {...axisProps(pal)} width={44} tickFormatter={(v) => fix(v, 2)} />
              <Tooltip {...tooltipStyle(pal)} formatter={(v, n) => [fix(Number(v), 4), n === "fit" ? "ajuste" : "A"]} labelFormatter={(v) => `c = ${fmt(Number(v), 4)} × ${fmt(scale)} mol/L`} />
              {reg && <Line dataKey="fit" stroke={pal.muted} strokeDasharray="5 4" dot={false} isAnimationActive={false} />}
              <Scatter dataKey="A" fill={pal.brand} />
              {unknown && <ReferenceLine y={unknown.A} stroke={pal.warn} strokeDasharray="4 4" label={{ value: "amostra", fill: pal.warn, fontSize: 11, position: "insideTopLeft" }} />}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card title="Bancada">
          <div className="space-y-3">
            <Slider label="Ruído instrumental (s de A)" value={noise} onChange={setNoise} min={0} max={0.02} step={0.001} format={(v) => fix(v, 3)} />
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={addStd}><Plus className="size-4" /> Medir padrão atual</Button>
              <Button onClick={autoStds}>Gerar 6 padrões</Button>
              <Button variant="ghost" onClick={() => { setStds([]); setUnknown(null); }}><Trash2 className="size-4" /> Limpar</Button>
            </div>
            <Button className="w-full" variant="soft" disabled={!reg} onClick={() => { const real = rng.num(0.15, 0.85, 3) * (0.9 / (eps * b)); setUnknown({ real, A: real * eps * b + noise * (rng.next() * 2 - 1) }); }}>
              <FlaskConical className="size-4" /> Medir amostra desconhecida
            </Button>
            {unknown && pred && reg && (
              <div className="space-y-2">
                <Stat label="A da amostra" value={fix(unknown.A, 4)} />
                <Stat label="c calculada (IC 95 %)" value={`${fmt(pred.x, 4)} ± ${fmt(pred.half, 2)}`} unit="mol/L" tone="brand" />
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="ok">valor real: {fmt(unknown.real, 4)}</Badge>
                  <Badge>erro: {fix((100 * (pred.x - unknown.real)) / unknown.real, 2)} %</Badge>
                  <Badge>LOD: {fmt(lodLoq(reg.syx, reg.slope).lod, 2)} M</Badge>
                </div>
              </div>
            )}
            {stds.length > 0 && stds.length < 3 && <Callout kind="info">Meça mais {3 - stds.length} padrão(ões) para ajustar a reta.</Callout>}
          </div>
        </Card>
      </div>
    </div>
  );
}
