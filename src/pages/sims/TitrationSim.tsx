import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Droplet, Pause, Play, RotateCcw, Trophy, Eye, EyeOff } from "lucide-react";
import { equivalenceVolumes, getWeak, indicatorColor, INDICATORS, pHAt, titrationCurve, WEAK_LIBRARY, type Species, type TitrationSetup } from "../../engine/acidbase";
import { fix, fmt, Rng } from "../../engine/math";
import { Badge, Button, Callout, Card, NumField, PageHeader, Segmented, Select, Slider, Stat } from "../../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../../components/charts";
import { downloadCSV } from "../../lib/export";

type AnalyteId = "hcl" | "naoh" | string;

const ANALYTES: { value: AnalyteId; label: string }[] = [
  { value: "hcl", label: "HCl (ácido forte)" },
  { value: "naoh", label: "NaOH (base forte)" },
  ...WEAK_LIBRARY.filter((w) => ["acetic", "formic", "benzoic", "hf", "boric", "phosphoric", "carbonic", "oxalic", "citric", "ammonia", "pyridine", "tris", "ethylenediamine"].includes(w.id)).map((w) => ({ value: w.id, label: `${w.name} (${w.kind === "ácido" ? "ácido" : "base"}${w.pKa.length > 1 ? `, ${w.pKa.length} pKa` : ""})` })),
];

function makeAnalyte(id: AnalyteId, C: number): Species {
  if (id === "hcl") return { type: "strong-acid", C };
  if (id === "naoh") return { type: "strong-base", C };
  return { type: "weak", entry: getWeak(id), C };
}
const isAcid = (s: Species) => s.type === "strong-acid" || (s.type === "weak" && s.entry.kind === "ácido");

const BURET_CAP = 50;

interface DropAnim {
  id: number;
}

/** Aparelho de titulação em SVG animado. */
function Apparatus({ V, pH, color, flowing, drops, titrantName }: { V: number; pH: number; color: string; flowing: boolean; drops: DropAnim[]; titrantName: string }) {
  const buretTop = 20, buretBottom = 250;
  const level = buretTop + 8 + ((buretBottom - buretTop - 8) * Math.min(V, BURET_CAP)) / BURET_CAP;
  const fillFrac = Math.min(1, 0.35 + V / 120);
  const liquidTop = 395 - 70 * fillFrac;
  return (
    <svg viewBox="0 0 300 470" className="mx-auto h-[420px] w-full max-w-[320px]" role="img" aria-label="Aparelho de titulação">
      {/* suporte */}
      <rect x="40" y="10" width="8" height="440" rx="3" fill="var(--muted)" opacity="0.5" />
      <rect x="20" y="448" width="260" height="12" rx="4" fill="var(--muted)" opacity="0.4" />
      <rect x="44" y="120" width="100" height="6" rx="3" fill="var(--muted)" opacity="0.6" />
      {/* bureta */}
      <rect x="138" y={buretTop} width="24" height={buretBottom - buretTop} rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" opacity="0.95" />
      <motion.rect x="140" width="20" animate={{ y: level, height: Math.max(0, buretBottom - level) }} transition={{ duration: 0.15 }} fill="#7cc6f0" opacity="0.55" />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <line x1="138" x2={i % 2 ? 146 : 150} y1={buretTop + 8 + (i * (buretBottom - buretTop - 8)) / 10} y2={buretTop + 8 + (i * (buretBottom - buretTop - 8)) / 10} stroke="var(--ink)" strokeWidth="1" />
          {i % 2 === 0 && <text x="166" y={buretTop + 11 + (i * (buretBottom - buretTop - 8)) / 10} fontSize="9" fill="var(--muted)">{i * 5}</text>}
        </g>
      ))}
      <text x="150" y="14" textAnchor="middle" fontSize="10" fill="var(--muted)">{titrantName}</text>
      {/* torneira */}
      <path d={`M144 ${buretBottom} L156 ${buretBottom} L153 ${buretBottom + 22} L147 ${buretBottom + 22} Z`} fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
      <motion.rect x="132" y={buretBottom + 6} width="36" height="7" rx="3" fill={flowing ? "var(--brand)" : "var(--muted)"} animate={{ rotate: flowing ? 0 : 90 }} style={{ originX: "150px", originY: `${buretBottom + 9.5}px` }} />
      <path d={`M148 ${buretBottom + 22} L152 ${buretBottom + 22} L151 ${buretBottom + 38} L149 ${buretBottom + 38} Z`} fill="var(--ink)" opacity="0.7" />
      {/* gotas */}
      <AnimatePresence>
        {drops.map((d) => (
          <motion.ellipse key={d.id} cx="150" rx="3" ry="4.2" fill="#7cc6f0" initial={{ cy: buretBottom + 40, opacity: 1 }} animate={{ cy: liquidTop, opacity: [1, 1, 0.2] }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: "easeIn" }} />
        ))}
      </AnimatePresence>
      {/* erlenmeyer */}
      <defs>
        <clipPath id="erl">
          <path d="M132 310 h36 v25 l50 62 a8 8 0 0 1 -6 13 h-124 a8 8 0 0 1 -6 -13 l50 -62 z" />
        </clipPath>
      </defs>
      <g clipPath="url(#erl)">
        <motion.rect x="60" width="180" height="120" animate={{ y: liquidTop, fill: color }} transition={{ duration: 0.4 }} />
        {/* ondas de agitação */}
        <motion.path d={`M60 ${liquidTop} q22 -5 45 0 t45 0 t45 0 t45 0`} fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="2" animate={{ x: [-45, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} />
      </g>
      <path d="M132 310 h36 v25 l50 62 a8 8 0 0 1 -6 13 h-124 a8 8 0 0 1 -6 -13 l50 -62 z" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      {/* agitador magnético */}
      <rect x="70" y="412" width="160" height="34" rx="6" fill="var(--surface-2)" stroke="var(--line)" />
      <motion.rect x="138" y="402" width="24" height="5" rx="2.5" fill="var(--ink)" animate={{ scaleX: [1, 0.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }} />
      <circle cx="210" cy="429" r="6" fill="var(--brand)" />
      {/* pHmetro */}
      <g>
        <rect x="200" y="160" width="90" height="62" rx="8" fill="#16201d" />
        <rect x="207" y="168" width="76" height="32" rx="4" fill="#0b3b2e" />
        <text x="245" y="191" textAnchor="middle" fontSize="20" fontFamily="var(--font-mono)" fill="#7ff5b8">{fix(pH, 2)}</text>
        <text x="245" y="214" textAnchor="middle" fontSize="9" fill="#9bb">pH</text>
        <path d="M245 222 C 245 270, 200 280, 192 330 L 190 380" fill="none" stroke="var(--muted)" strokeWidth="2" />
        <rect x="186" y="330" width="8" height="58" rx="3" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default function TitrationSim() {
  const pal = usePalette();
  const [analyteId, setAnalyteId] = useState<AnalyteId>("acetic");
  const [Ca, setCa] = useState(0.1);
  const [Va, setVa] = useState(25);
  const [Ct, setCt] = useState(0.1);
  const [indName, setIndName] = useState("Fenolftaleína");
  const [V, setV] = useState(0);
  const [flowing, setFlowing] = useState(false);
  const [rate, setRate] = useState(0.5);
  const [drops, setDrops] = useState<DropAnim[]>([]);
  const [log, setLog] = useState<{ V: number; pH: number }[]>([{ V: 0, pH: NaN }]);
  const [showTheory, setShowTheory] = useState(true);
  const [mode, setMode] = useState<"livre" | "desafio">("livre");
  const [secret, setSecret] = useState(0.1);
  const [guess, setGuess] = useState(0);
  const [verdict, setVerdict] = useState<null | { ok: boolean; err: number }>(null);

  const analyte = makeAnalyte(analyteId, mode === "desafio" ? secret : Ca);
  const titrant: Species = isAcid(analyte) ? { type: "strong-base", C: Ct } : { type: "strong-acid", C: Ct };
  const setup: TitrationSetup = useMemo(() => ({ analyte, Va, titrant, Vmax: BURET_CAP, points: 251 }), [analyteId, Ca, Va, Ct, mode, secret]); // eslint-disable-line react-hooks/exhaustive-deps
  const pH = useMemo(() => pHAt(setup, V), [setup, V]);
  const eqs = useMemo(() => equivalenceVolumes(setup).filter((v) => v <= BURET_CAP), [setup]);
  const theory = useMemo(() => titrationCurve(setup), [setup]);
  const ind = INDICATORS.find((i) => i.name === indName) ?? INDICATORS[5];
  const { color } = indicatorColor(ind, pH);
  const liquidColor = color.endsWith("0.000)") ? "rgba(190, 225, 240, 0.55)" : color;

  // registra pontos
  const lastLogged = useRef(0);
  useEffect(() => {
    if (Math.abs(V - lastLogged.current) >= 0.1 || V === 0) {
      lastLogged.current = V;
      setLog((l) => [...l.filter((p) => p.V < V - 1e-9), { V: +V.toFixed(2), pH }]);
    }
  }, [V, pH]);

  const reset = useCallback(() => {
    setFlowing(false);
    setV(0);
    lastLogged.current = 0;
    setLog([{ V: 0, pH: NaN }]);
    setVerdict(null);
  }, []);
  useEffect(() => {
    reset();
  }, [setup, reset]);

  // fluxo contínuo
  useEffect(() => {
    if (!flowing) return;
    let raf = 0, last = performance.now(), acc = 0, dropId = 0;
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setV((v) => {
        const nv = Math.min(BURET_CAP, v + rate * dt);
        if (nv >= BURET_CAP) setFlowing(false);
        return nv;
      });
      acc += dt;
      if (acc > Math.max(0.12, 0.35 / rate)) {
        acc = 0;
        const id = Date.now() + dropId++;
        setDrops((d) => [...d.slice(-6), { id }]);
        setTimeout(() => setDrops((d) => d.filter((x) => x.id !== id)), 500);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [flowing, rate]);

  const addVolume = (dv: number) => {
    const id = Date.now();
    setDrops((d) => [...d, { id }]);
    setTimeout(() => setDrops((d) => d.filter((x) => x.id !== id)), 500);
    setTimeout(() => setV((v) => Math.min(BURET_CAP, +(v + dv).toFixed(3))), 380);
  };

  const newChallenge = () => {
    const r = new Rng(Date.now());
    setSecret(r.num(0.06, 0.18, 3));
    setMode("desafio");
    setGuess(0);
  };

  const data = log.filter((p) => isFinite(p.pH));
  const titrantName = isAcid(analyte) ? `NaOH ${fmt(Ct, 3)} M` : `HCl ${fmt(Ct, 3)} M`;
  const merged = theory.map((p) => ({ V: +p.V.toFixed(3), teorica: p.pH }));

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Simulador · Volumetria de neutralização"
        title="Titulação animada"
        subtitle="Abra a torneira, adicione gotas e observe o indicador e o pHmetro. O pH é calculado exatamente pelo balanço de carga em cada instante."
        actions={<Segmented value={mode} onChange={(m) => (m === "desafio" ? newChallenge() : setMode("livre"))} options={[{ value: "livre", label: "Modo livre" }, { value: "desafio", label: "Desafio" }]} />}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(300px,380px)_1fr]">
        <Card pad={false} className="overflow-hidden">
          <div className="p-3"><Apparatus V={V} pH={pH} color={liquidColor} flowing={flowing} drops={drops} titrantName={titrantName} /></div>
          <div className="space-y-3 border-t border-line p-4">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Volume adicionado" value={fix(V, 2)} unit="mL" />
              <Stat label="pH" value={fix(pH, 2)} tone="brand" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={flowing ? "danger" : "primary"} onClick={() => setFlowing(!flowing)} disabled={V >= BURET_CAP}>
                {flowing ? <Pause className="size-4" /> : <Play className="size-4" />} {flowing ? "Fechar torneira" : "Abrir torneira"}
              </Button>
              <Button onClick={() => addVolume(0.05)} disabled={flowing}><Droplet className="size-4" /> 1 gota</Button>
              <Button onClick={() => addVolume(0.5)} disabled={flowing}>+0,5 mL</Button>
              <Button onClick={() => addVolume(1)} disabled={flowing}>+1 mL</Button>
              <Button variant="ghost" onClick={reset}><RotateCcw className="size-4" /> Reiniciar</Button>
            </div>
            <Slider label="Vazão da torneira" value={rate} onChange={setRate} min={0.05} max={3} step={0.05} format={(v) => `${fix(v, 2)} mL/s`} />
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          <Card title="Montagem">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Select label="Analito" value={analyteId} onChange={setAnalyteId} options={ANALYTES} />
              {mode === "livre" ? <NumField label="Concentração do analito" value={Ca} onChange={setCa} unit="mol/L" /> : <div className="rounded-xl border border-dashed border-warn/50 bg-warn-soft px-3 py-2 text-sm"><b>Concentração desconhecida.</b> Titule e calcule!</div>}
              <NumField label="Volume da alíquota" value={Va} onChange={setVa} unit="mL" />
              <NumField label={`Titulante (${isAcid(analyte) ? "NaOH" : "HCl"})`} value={Ct} onChange={setCt} unit="mol/L" />
              <Select label="Indicador" value={indName} onChange={setIndName} options={INDICATORS.map((i) => ({ value: i.name, label: `${i.name} (${fix(i.range[0], 1)}–${fix(i.range[1], 1)})` }))} />
              <div className="flex items-end">
                <div className="flex h-10 w-full items-center gap-2 rounded-xl border border-line px-3">
                  <span className="size-5 rounded-full border border-line" style={{ background: ind.acid.endsWith("00") ? "transparent" : ind.acid }} />
                  <span className="text-xs text-muted">→</span>
                  <span className="size-5 rounded-full border border-line" style={{ background: ind.base }} />
                  <span className="text-xs text-muted">viragem</span>
                </div>
              </div>
            </div>
            {mode === "livre" && eqs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {eqs.map((v, i) => <Badge key={i} tone="brand">PE{eqs.length > 1 ? i + 1 : ""}: {fix(v, 2)} mL · pH {fix(pHAt(setup, v), 2)}</Badge>)}
                {eqs.map((v, i) => {
                  const p = pHAt(setup, v);
                  const ok = p >= ind.range[0] - 0.3 && p <= ind.range[1] + 0.3;
                  return <Badge key={`i${i}`} tone={ok ? "ok" : "warn"}>{ok ? "Indicador adequado" : "Indicador vira fora do PE"}{eqs.length > 1 ? ` (PE${i + 1})` : ""}</Badge>;
                })}
              </div>
            )}
          </Card>

          <ChartCard
            title="Curva de titulação (pontos registrados)"
            subtitle="Cada 0,1 mL é registrado — exporte para fazer seu relatório"
            height={340}
            csvName="titulacao-pontos"
            data={data.map((p) => ({ "Volume (mL)": p.V, pH: +p.pH.toFixed(3) }))}
            extraActions={
              <Button size="sm" variant="ghost" onClick={() => setShowTheory(!showTheory)} disabled={mode === "desafio"}>
                {showTheory && mode === "livre" ? <EyeOff className="size-4" /> : <Eye className="size-4" />} Teórica
              </Button>
            }
          >
            <ResponsiveContainer>
              <LineChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
                <XAxis dataKey="V" type="number" domain={[0, BURET_CAP]} {...axisProps(pal)} label={{ value: "Volume de titulante (mL)", position: "insideBottom", offset: -4, fill: pal.muted, fontSize: 12 }} />
                <YAxis domain={[0, 14]} ticks={[0, 2, 4, 6, 8, 10, 12, 14]} {...axisProps(pal)} width={36} />
                <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 2)} labelFormatter={(v) => `${fix(Number(v), 2)} mL`} />
                <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={ind.range[0]} stroke={pal.warn} strokeDasharray="2 4" />
                <ReferenceLine y={ind.range[1]} stroke={pal.warn} strokeDasharray="2 4" label={{ value: "faixa do indicador", fill: pal.warn, fontSize: 11, position: "insideTopRight" }} />
                {mode === "livre" && eqs.map((v, i) => <ReferenceLine key={i} x={v} stroke={pal.muted} strokeDasharray="4 4" />)}
                {showTheory && mode === "livre" && <Line data={merged} dataKey="teorica" name="Teórica" stroke={pal.muted} strokeOpacity={0.5} dot={false} strokeWidth={1.5} isAnimationActive={false} />}
                <Line data={data} dataKey="pH" name="Medido" stroke={pal.brand} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {mode === "desafio" && (
            <Card title={<span className="flex items-center gap-2"><Trophy className="size-4 text-warn" /> Desafio: determine a concentração do analito</span>}>
              <p className="mb-3 text-sm text-muted">Titule até o ponto final (viragem do indicador), anote o volume e calcule c(analito) = c(titulante)·V(titulante)/V(alíquota) — atenção à estequiometria para polipróticos.</p>
              <div className="flex flex-wrap items-end gap-2">
                <NumField label="Sua resposta" value={guess} onChange={setGuess} unit="mol/L" className="w-48" />
                <Button variant="primary" onClick={() => { const err = (100 * (guess - secret)) / secret; setVerdict({ ok: Math.abs(err) <= 2, err }); }}>Conferir</Button>
                <Button onClick={() => { newChallenge(); setVerdict(null); }}>Nova amostra</Button>
              </div>
              {verdict && (
                <Callout kind={verdict.ok ? "ok" : "bad"} title={verdict.ok ? "Excelente! Erro dentro de ±2 %." : "Ainda não…"}>
                  Valor real: <b>{fmt(secret, 3)} mol/L</b> · seu erro relativo: <b>{fix(verdict.err, 1)} %</b>. PE teórico em {fix(eqs[0] ?? NaN, 2)} mL.
                </Callout>
              )}
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => downloadCSV(merged.map((p) => ({ "Volume (mL)": p.V, "pH teórico": +p.teorica.toFixed(3) })), "curva-teorica")}>Baixar curva teórica (CSV)</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
