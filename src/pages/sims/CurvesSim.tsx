import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { titrationCurve, equivalenceVolumes, getWeak, type AcidBaseEntry, type Species } from "../../engine/acidbase";
import { alphaY4, argCurve, edtaConditionalK, edtaCurve, KSP, METALS_EDTA, REDOX_PRESETS, redoxCurve } from "../../engine/equilibria";
import { fix, fmt, linspace, log10 } from "../../engine/math";
import { Callout, Card, NumField, PageHeader, Segmented, Select, Slider, Stat, Tex } from "../../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../../components/charts";

type Tab = "acidobase" | "edta" | "precip" | "redox";

/** Junta várias séries {V,y} em linhas por V para exportação/Recharts. */
function mergeSeries(series: { name: string; pts: { V: number; y: number }[] }[], Vmax: number, n = 241) {
  const vs = linspace(0, Vmax, n);
  return vs.map((V) => {
    const row: Record<string, number> = { V: +V.toFixed(3) };
    for (const s of series) {
      // interpolação linear
      const p = s.pts;
      let i = p.findIndex((q) => q.V >= V);
      if (i === -1) i = p.length - 1;
      if (i === 0) i = 1;
      const a = p[i - 1], b = p[i];
      const y = b.V === a.V ? a.y : a.y + ((b.y - a.y) * (V - a.V)) / (b.V - a.V);
      row[s.name] = isFinite(y) ? +y.toFixed(4) : NaN;
    }
    return row;
  });
}

function MultiCurve({ title, subtitle, series, Vmax, yLabel, yDomain, refX = [], csv }: { title: string; subtitle?: string; series: { name: string; pts: { V: number; y: number }[] }[]; Vmax: number; yLabel: string; yDomain: [number | "auto", number | "auto"]; refX?: number[]; csv: string }) {
  const pal = usePalette();
  const data = useMemo(() => mergeSeries(series, Vmax), [series, Vmax]);
  return (
    <ChartCard title={title} subtitle={subtitle} data={data} csvName={csv} height={380}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 12, left: 4 }}>
          <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
          <XAxis dataKey="V" type="number" domain={[0, Vmax]} {...axisProps(pal)} tickFormatter={(v) => fix(v, 0)} label={{ value: "Volume de titulante (mL)", position: "insideBottom", offset: -6, fill: pal.muted, fontSize: 12 }} />
          <YAxis domain={yDomain} {...axisProps(pal)} width={44} tickFormatter={(v) => fix(v, Math.abs(v) < 3 && yLabel.startsWith("E") ? 2 : 0)} label={{ value: yLabel, angle: -90, position: "insideLeft", fill: pal.muted, fontSize: 12 }} />
          <Tooltip {...tooltipStyle(pal)} formatter={(v) => fix(Number(v), 3)} labelFormatter={(v) => `${fix(Number(v), 2)} mL`} />
          <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
          {refX.map((x, i) => <ReferenceLine key={i} x={x} stroke={pal.muted} strokeDasharray="4 4" />)}
          {series.map((s, i) => <Line key={s.name} dataKey={s.name} stroke={pal.series[i % pal.series.length]} strokeWidth={2.2} dot={false} animationDuration={700} />)}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function AcidBase() {
  const [C, setC] = useState(0.1);
  const [Va, setVa] = useState(25);
  const [Cb, setCb] = useState(0.1);
  const [family, setFamily] = useState<"pka" | "conc" | "poly">("pka");
  const series = useMemo(() => {
    const Vmax = (2.2 * C * Va) / Cb;
    if (family === "pka") {
      const list: { name: string; entry?: AcidBaseEntry; pKa?: number }[] = [{ name: "HCl (forte)" }, ...[3, 5, 7, 9].map((pKa) => ({ name: `pKa ${pKa}`, pKa }))];
      return list.map((l) => {
        const analyte: Species = l.pKa === undefined ? { type: "strong-acid", C } : { type: "weak", C, entry: { id: "x", name: l.name, formula: "HA", pKa: [l.pKa], z: 0, kind: "ácido" } };
        return { name: l.name, pts: titrationCurve({ analyte, Va, titrant: { type: "strong-base", C: Cb }, Vmax, points: 200 }).map((p) => ({ V: p.V, y: p.pH })) };
      });
    }
    if (family === "conc") {
      return [1, 0.1, 0.01, 0.001].map((c) => ({
        name: `${fmt(c)} M`,
        pts: titrationCurve({ analyte: { type: "weak", C: c, entry: getWeak("acetic") }, Va, titrant: { type: "strong-base", C: c }, Vmax: 2.2 * Va, points: 200 }).map((p) => ({ V: p.V, y: p.pH })),
      }));
    }
    return ["phosphoric", "carbonic", "oxalic", "citric"].map((id) => {
      const e = getWeak(id);
      const Vm = (C * Va * (e.pKa.length + 0.6)) / Cb;
      return { name: e.name, pts: titrationCurve({ analyte: { type: "weak", C, entry: e }, Va, titrant: { type: "strong-base", C: Cb }, Vmax: Vm, points: 260 }).map((p) => ({ V: p.V, y: p.pH })) };
    });
  }, [C, Va, Cb, family]);
  const Vmax = family === "conc" ? 2.2 * Va : family === "poly" ? (C * Va * 3.6) / Cb : (2.2 * C * Va) / Cb;
  const veq = family === "poly" ? [1, 2, 3].map((k) => (k * C * Va) / Cb) : family === "conc" ? [Va] : equivalenceVolumes({ analyte: { type: "strong-acid", C }, Va, titrant: { type: "strong-base", C: Cb }, Vmax });
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Família de curvas" value={family} onChange={setFamily} options={[{ value: "pka", label: "Efeito do pKa" }, { value: "conc", label: "Efeito da concentração" }, { value: "poly", label: "Ácidos polipróticos" }]} />
          {family !== "conc" && <NumField label="c(ácido)" value={C} onChange={setC} unit="M" />}
          <NumField label="Alíquota" value={Va} onChange={setVa} unit="mL" />
          {family !== "conc" && <NumField label="c(NaOH)" value={Cb} onChange={setCb} unit="M" />}
        </div>
      </Card>
      <MultiCurve title="Titulação com NaOH" subtitle="pH exato pelo balanço de carga" series={series} Vmax={Vmax} yLabel="pH" yDomain={[0, 14]} refX={veq} csv="curvas-acido-base" />
      <Callout kind="tip">
        {family === "pka" && "Quanto maior o pKa (ácido mais fraco), menor o salto e mais básico o pH no PE. Com pKa ≈ 9 o salto quase desaparece (critério Ka·c ≥ 10⁻⁸)."}
        {family === "conc" && "Diluir analito e titulante reduz o salto. No meio do caminho (pH = pKa) todas as curvas coincidem — o tampão não depende da diluição."}
        {family === "poly" && "Saltos separados exigem K₁/K₂ > 10⁴. O ácido fosfórico mostra 2 saltos; o 3º próton é fraco demais. O cítrico (pKa próximos) dá um único salto no final."}
      </Callout>
    </div>
  );
}

function Edta() {
  const [metal, setMetal] = useState("Ca²⁺");
  const [CM, setCM] = useState(0.05);
  const [CY, setCY] = useState(0.05);
  const [VM, setVM] = useState(50);
  const [pH, setPH] = useState(10);
  const m = METALS_EDTA.find((x) => x.ion === metal)!;
  const s = { CM, VM, CY, logKf: m.logKf, pH, Vmax: (2 * CM * VM) / CY };
  const pHs = [6, 8, 10, 12];
  const series = useMemo(() => pHs.map((p) => ({ name: `pH ${p}`, pts: edtaCurve({ ...s, pH: p }).points.map((q) => ({ V: q.V, y: q.pM })) })), [metal, CM, CY, VM]); // eslint-disable-line react-hooks/exhaustive-deps
  const one = useMemo(() => [{ name: `pH ${fix(pH, 1)}`, pts: edtaCurve(s).points.map((q) => ({ V: q.V, y: q.pM })) }], [metal, CM, CY, VM, pH]); // eslint-disable-line react-hooks/exhaustive-deps
  const Kp = edtaConditionalK(s);
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select label="Metal" value={metal} onChange={setMetal} options={METALS_EDTA.map((x) => ({ value: x.ion, label: `${x.ion} (log Kf ${fix(x.logKf, 2)})` }))} />
          <NumField label="c(metal)" value={CM} onChange={setCM} unit="M" />
          <NumField label="Alíquota" value={VM} onChange={setVM} unit="mL" />
          <NumField label="c(EDTA)" value={CY} onChange={setCY} unit="M" />
          <Slider label="pH do tampão" value={pH} onChange={setPH} min={2} max={13} step={0.1} format={(v) => fix(v, 1)} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="α(Y⁴⁻)" value={fmt(alphaY4(pH), 3)} />
          <Stat label="log K'f" value={fix(log10(Kp), 2)} tone={log10(Kp) >= 8 ? "ok" : "bad"} sub={log10(Kp) >= 8 ? "titulação viável" : "K'f pequeno demais"} />
          <Stat label="V no PE" value={fix((CM * VM) / CY, 2)} unit="mL" />
          <Stat label="pH mínimo sugerido" value={fix(m.minPH, 1)} />
        </div>
      </Card>
      <MultiCurve title={`Curva pM — ${metal} com EDTA (pH ajustável)`} series={one} Vmax={s.Vmax} yLabel="pM" yDomain={[0, "auto"]} refX={[(CM * VM) / CY]} csv="edta-curva" />
      <MultiCurve title="Efeito do pH na curva" subtitle="Constante condicional K'f = α(Y⁴⁻)·Kf" series={series} Vmax={s.Vmax} yLabel="pM" yDomain={[0, "auto"]} refX={[(CM * VM) / CY]} csv="edta-efeito-ph" />
      <Card><Tex block>{String.raw`K_f' = \alpha_{Y^{4-}}K_f;\quad [M]_{PE}=\sqrt{\frac{c_{MY}}{K_f'}};\quad K_f'[M]^2+(K_f'(c_Y-c_M)+1)[M]-c_M=0`}</Tex></Card>
    </div>
  );
}

function Precip() {
  const [CX, setCX] = useState(0.05);
  const [VX, setVX] = useState(50);
  const [CAg, setCAg] = useState(0.1);
  const series = useMemo(
    () =>
      KSP.filter((k) => ["AgCl", "AgBr", "AgI", "AgSCN"].includes(k.formula)).map((k) => ({
        name: k.formula,
        pts: argCurve({ CX, VX, CAg, Ksp: k.Ksp, Vmax: (2 * CX * VX) / CAg }).points.map((p) => ({ V: p.V, y: p.pAg })),
      })),
    [CX, VX, CAg]
  );
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumField label="c(haleto)" value={CX} onChange={setCX} unit="M" />
          <NumField label="Alíquota" value={VX} onChange={setVX} unit="mL" />
          <NumField label="c(AgNO₃)" value={CAg} onChange={setCAg} unit="M" />
        </div>
      </Card>
      <MultiCurve title="Argentometria — pAg × volume" subtitle="Menor Kps → maior salto (AgI > AgBr > AgSCN > AgCl)" series={series} Vmax={(2 * CX * VX) / CAg} yLabel="pAg" yDomain={[0, "auto"]} refX={[(CX * VX) / CAg]} csv="argentometria" />
      <Callout kind="info">No PE, [Ag⁺] = √Kps. Antes do PE, pAg = pKps − pX (excesso de haleto); depois, o excesso de Ag⁺ domina e as curvas coincidem.</Callout>
    </div>
  );
}

function Redox() {
  const [preset, setPreset] = useState(REDOX_PRESETS[0].label);
  const [C1, setC1] = useState(0.05);
  const [V1, setV1] = useState(50);
  const [C2, setC2] = useState(0.1);
  const p = REDOX_PRESETS.find((x) => x.label === preset)!;
  const Veq = (p.n1 * C1 * V1) / (p.n2 * C2);
  const res = useMemo(() => redoxCurve({ ...p, C1, V1, C2, Vmax: 2 * Veq }), [preset, C1, V1, C2]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Sistema" value={preset} onChange={setPreset} options={REDOX_PRESETS.map((x) => ({ value: x.label, label: x.label }))} />
          <NumField label="c(analito)" value={C1} onChange={setC1} unit="M" />
          <NumField label="Alíquota" value={V1} onChange={setV1} unit="mL" />
          <NumField label="c(titulante)" value={C2} onChange={setC2} unit="M" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="V no PE" value={fix(res.Veq, 2)} unit="mL" />
          <Stat label="E no PE" value={fix(res.Eeq, 3)} unit="V" tone="brand" />
          <Stat label="E° analito" value={fix(p.E1, 3)} unit="V" sub={`n = ${p.n1}`} />
          <Stat label="E° titulante" value={fix(p.E2, 3)} unit="V" sub={`n = ${p.n2}`} />
        </div>
      </Card>
      <MultiCurve title="Potencial × volume" subtitle="Balanço de elétrons resolvido numericamente (vs EPH)" series={[{ name: "E (V)", pts: res.points.map((q) => ({ V: q.V, y: q.E })) }]} Vmax={2 * Veq} yLabel="E (V)" yDomain={["auto", "auto"]} refX={[res.Veq, res.Veq / 2]} csv="redox-curva" />
      <Callout kind="tip">Em ½·V_PE, E = E°(analito). Quando n₁ ≠ n₂ a curva é assimétrica e o PE fica mais próximo do par com mais elétrons: <Tex>{String.raw`E_{PE}=\frac{n_1E_1^\circ+n_2E_2^\circ}{n_1+n_2}`}</Tex>.</Callout>
    </div>
  );
}

export default function CurvesSim() {
  const [tab, setTab] = useState<Tab>("acidobase");
  return (
    <div className="space-y-5">
      <PageHeader kicker="Simulador · Métodos clássicos" title="Curvas de titulação" subtitle="Compare famílias de curvas e veja o efeito de cada variável. Todas as curvas são exatas e exportáveis (PNG, SVG, CSV)." />
      <Segmented value={tab} onChange={setTab} options={[{ value: "acidobase", label: "Ácido-base" }, { value: "edta", label: "Complexometria (EDTA)" }, { value: "precip", label: "Precipitação" }, { value: "redox", label: "Oxirredução" }]} />
      {tab === "acidobase" && <AcidBase />}
      {tab === "edta" && <Edta />}
      {tab === "precip" && <Precip />}
      {tab === "redox" && <Redox />}
    </div>
  );
}
