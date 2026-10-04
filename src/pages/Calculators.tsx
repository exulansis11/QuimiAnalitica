import { useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Atom, Beaker, Calculator, Droplets, FlaskRound, Gauge, Hash, Scale, Sigma, Sparkles, TestTube, Waves, Zap, BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Button, Callout, Card, Grid, NumField, PageHeader, Segmented, Select, Stat, Steps, Tex, type Step } from "../components/ui";
import { axisProps, ChartCard, tooltipStyle, usePalette } from "../components/charts";
import { countSigFigs, fix, fmt, log10, roundSig } from "../engine/math";
import { COMMON_COMPOUNDS, CONC_UNITS, fromGperL, molarMass, mm, prettyFormula, REAGENTS, toGperL, type ConcUnit } from "../engine/stoich";
import { bufferCapacity, getWeak, hendersonHasselbalch, KW, pHStrongAcid, pHStrongBase, pHWeakAcid, pHWeakBase, solvePH, WEAK_LIBRARY, type WeakSystem } from "../engine/acidbase";
import { activityCoefficient, daviesGamma, deltaG, ionicStrength, KSP, logKfromE, nernst, solubility, STANDARD_POTENTIALS } from "../engine/equilibria";
import { confidenceInterval, fTest, grubbs, parseList, propAdd, propMul, qTest, tTestPaired, tTestReference, tTestTwo } from "../engine/stats";
import { platesHalf, plates, purnell, resolution, retentionFactor, selectivity, twoComponent } from "../engine/instrumental";
import { downloadCSV } from "../lib/export";

const r = String.raw;
const T = (x: number, s = 4) => {
  if (!isFinite(x)) return "—";
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) {
    const e = Math.floor(log10(a));
    return `${String(roundSig(x / 10 ** e, s)).replace(".", "{,}")}\\times10^{${e}}`;
  }
  return String(roundSig(x, s)).replace(".", "{,}");
};

interface CalcDef {
  id: string;
  title: string;
  desc: string;
  icon: typeof Calculator;
  level: number;
  el: () => ReactNode;
}

function Result({ children }: { children: ReactNode }) {
  return <div className="mt-4 space-y-3">{children}</div>;
}

/* =============================== Matemática =============================== */
function MathCalc() {
  const [raw, setRaw] = useState("0,004520");
  const [x, setX] = useState(2.5e-4);
  const [mode, setMode] = useState<"sf" | "p" | "r3">("sf");
  const [a, setA] = useState(2), [b, setB] = useState(0.15), [c, setC] = useState(5);
  const n = countSigFigs(raw);
  return (
    <Card>
      <Segmented value={mode} onChange={setMode} options={[{ value: "sf", label: "Algarismos significativos" }, { value: "p", label: "Escala p / log" }, { value: "r3", label: "Regra de três" }]} />
      {mode === "sf" && (
        <div className="mt-4 space-y-3">
          <label className="block max-w-sm">
            <span className="mb-1 block text-[13px] font-medium text-muted">Número (como escrito)</span>
            <input className="num h-10 w-full rounded-xl border border-line bg-surface px-3" value={raw} onChange={(e) => setRaw(e.target.value)} />
          </label>
          <Grid cols={3}>
            <Stat label="Algarismos significativos" value={isFinite(n) ? n : "—"} tone="brand" />
            <Stat label="Notação científica" value={isFinite(Number(raw.replace(",", "."))) ? fmt(Number(raw.replace(",", ".")), isFinite(n) ? n : 4) : "—"} />
            <Stat label="Arredondado a 2 sig." value={fmt(roundSig(Number(raw.replace(",", ".")), 2), 2)} />
          </Grid>
          <Callout kind="tip">Zeros à esquerda não contam; zeros entre dígitos e à direita após a vírgula contam. Em “2500” sem vírgula os zeros são ambíguos.</Callout>
        </div>
      )}
      {mode === "p" && (
        <div className="mt-4 space-y-3">
          <NumField label="Concentração [X] (mol/L)" value={x} onChange={setX} className="max-w-sm" />
          <Grid cols={3}>
            <Stat label="pX = −log[X]" value={fix(-log10(x), 3)} tone="brand" />
            <Stat label="Se X = H⁺: pOH" value={fix(14 + log10(x), 3)} />
            <Stat label="Se X = H⁺: [OH⁻]" value={fmt(KW / x)} unit="M" />
          </Grid>
          <Steps steps={[{ title: "Definição", tex: r`\text{p}X=-\log(${T(x)})=${T(-log10(x), 4)}` }, { title: "Volta", tex: r`[X]=10^{-\text{p}X}` }]} startOpen={false} />
        </div>
      )}
      {mode === "r3" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">Se <b>a</b> corresponde a <b>b</b>, então <b>c</b> corresponde a <b>x</b> (proporção direta).</p>
          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            <NumField label="a" value={a} onChange={setA} />
            <NumField label="b" value={b} onChange={setB} />
            <NumField label="c" value={c} onChange={setC} />
          </div>
          <Stat label="x = b·c/a" value={fmt((b * c) / a)} tone="brand" />
        </div>
      )}
    </Card>
  );
}

/* =============================== Massa molar =============================== */
function MolarMassCalc() {
  const pal = usePalette();
  const [f, setF] = useState("CuSO4·5H2O");
  const [mass, setMass] = useState(1);
  let res: ReturnType<typeof molarMass> | null = null;
  let err = "";
  try {
    res = molarMass(f);
  } catch (e) {
    err = (e as Error).message;
  }
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-muted">Fórmula (aceita parênteses, colchetes e hidratos com · ou .)</span>
            <input className="h-10 w-full rounded-xl border border-line bg-surface px-3 font-mono" value={f} onChange={(e) => setF(e.target.value)} />
          </label>
          <NumField label="Massa (g) para converter" value={mass} onChange={setMass} unit="g" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {COMMON_COMPOUNDS.slice(0, 18).map((c) => <button key={c.formula} title={c.name} onClick={() => setF(c.formula)} className="rounded-lg border border-line px-2 py-1 font-mono text-xs hover:border-brand">{prettyFormula(c.formula)}</button>)}
        </div>
        {err && <Callout kind="bad">{err}</Callout>}
        {res && (
          <Result>
            <Grid cols={3}>
              <Stat label={`M(${prettyFormula(f)})`} value={fix(res.total, 3)} unit="g/mol" tone="brand" big />
              <Stat label={`n em ${fmt(mass)} g`} value={fmt(mass / res.total)} unit="mol" />
              <Stat label="Moléculas" value={fmt((mass / res.total) * 6.02214076e23)} />
            </Grid>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted"><th className="py-1.5">Elemento</th><th>Qtd.</th><th>Massa atômica</th><th>Subtotal</th><th>% em massa</th></tr></thead>
                <tbody>
                  {res.rows.map((row) => (
                    <tr key={row.symbol} className="border-t border-line">
                      <td className="py-1.5"><b>{row.symbol}</b> <span className="text-muted">{row.name}</span></td>
                      <td className="num">{row.count}</td><td className="num">{fix(row.mass, 3)}</td><td className="num">{fix(row.subtotal, 3)}</td><td className="num">{fix(row.pct, 2)} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Result>
        )}
      </Card>
      {res && (
        <ChartCard title="Composição percentual em massa" data={res.rows.map((x) => ({ elemento: x.symbol, "%": +x.pct.toFixed(3) }))} csvName={`composicao-${f}`} height={220}>
          <ResponsiveContainer>
            <BarChart data={res.rows.map((x) => ({ el: x.symbol, pct: x.pct }))} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid stroke={pal.grid} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} {...axisProps(pal)} unit="%" />
              <YAxis type="category" dataKey="el" {...axisProps(pal)} width={36} />
              <Tooltip {...tooltipStyle(pal)} formatter={(v) => `${fix(Number(v), 2)} %`} />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]}>{res.rows.map((_, i) => <Cell key={i} fill={pal.series[i % pal.series.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

/* =============================== Soluções =============================== */
function SolutionsCalc() {
  const [mode, setMode] = useState<"conv" | "dil" | "prep" | "reag">("conv");
  const [formula, setFormula] = useState("NaCl");
  const [val, setVal] = useState(0.1);
  const [unit, setUnit] = useState<ConcUnit>("mol/L");
  const [c1, setC1] = useState(1), [v1, setV1] = useState(10), [c2, setC2] = useState(0.1), [v2, setV2] = useState(0);
  const [cp, setCp] = useState(0.1), [vp, setVp] = useState(250), [pur, setPur] = useState(99.5);
  const [reag, setReag] = useState(REAGENTS[0].name), [ct, setCt] = useState(0.1), [vt, setVt] = useState(1000);
  let M = NaN;
  try { M = mm(formula); } catch { /* fórmula inválida */ }
  const gL = toGperL(val, unit, M);
  const dilV2 = (c1 * v1) / c2;
  const R = REAGENTS.find((x) => x.name === reag)!;
  const cR = (1000 * R.d * R.pct) / 100 / mm(R.formula);
  return (
    <Card>
      <Segmented value={mode} onChange={setMode} options={[{ value: "conv", label: "Conversor" }, { value: "dil", label: "Diluição C₁V₁=C₂V₂" }, { value: "prep", label: "Preparo (sólido)" }, { value: "reag", label: "A partir de reagente comercial" }]} />
      {mode !== "dil" && mode !== "reag" && (
        <label className="mt-4 block max-w-xs">
          <span className="mb-1 block text-[13px] font-medium text-muted">Soluto (fórmula)</span>
          <input className="h-10 w-full rounded-xl border border-line bg-surface px-3 font-mono" value={formula} onChange={(e) => setFormula(e.target.value)} />
          <span className="mt-1 block text-xs text-muted">M = {isFinite(M) ? `${fix(M, 3)} g/mol` : "fórmula inválida"}</span>
        </label>
      )}
      {mode === "conv" && (
        <div className="mt-3 space-y-3">
          <div className="grid max-w-lg gap-3 sm:grid-cols-2">
            <NumField label="Valor" value={val} onChange={setVal} />
            <Select label="Unidade" value={unit} onChange={setUnit} options={CONC_UNITS.map((u) => ({ value: u, label: u }))} />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {CONC_UNITS.map((u) => <Stat key={u} label={u} value={fmt(fromGperL(gL, u, M))} tone={u === unit ? "brand" : undefined} />)}
          </div>
          <Callout kind="info">ppm e ppb assumem solução aquosa diluída (densidade ≈ 1 g/mL).</Callout>
        </div>
      )}
      {mode === "dil" && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="C₁ (estoque)" value={c1} onChange={setC1} />
            <NumField label="V₁ (alíquota)" value={v1} onChange={setV1} unit="mL" />
            <NumField label="C₂ (desejada)" value={c2} onChange={setC2} />
          </div>
          <Grid cols={3}>
            <Stat label="V₂ final" value={fmt(dilV2)} unit="mL" tone="brand" />
            <Stat label="Fator de diluição" value={fmt(c1 / c2)} />
            <Stat label="Água a adicionar ≈" value={fmt(dilV2 - v1)} unit="mL" />
          </Grid>
          <Steps steps={[{ title: "Conservação do soluto", tex: r`C_1V_1=C_2V_2\Rightarrow V_2=\frac{${T(c1)}\times${T(v1)}}{${T(c2)}}=${T(dilV2)}\ \text{mL}` }]} />
          <NumField label="(ou) calcule C₂ para um V₂ dado" value={v2} onChange={setV2} unit="mL" className="max-w-xs" hint={v2 > 0 ? `C₂ = ${fmt((c1 * v1) / v2)}` : "digite V₂"} />
        </div>
      )}
      {mode === "prep" && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="Concentração desejada" value={cp} onChange={setCp} unit="mol/L" />
            <NumField label="Volume do balão" value={vp} onChange={setVp} unit="mL" />
            <NumField label="Pureza do reagente" value={pur} onChange={setPur} unit="%" />
          </div>
          <Stat label="Massa a pesar" value={fix((cp * (vp / 1000) * M) / (pur / 100), 4)} unit="g" tone="brand" big />
          <Steps steps={[
            { title: "Mols necessários", tex: r`n=${T(cp)}\times${T(vp / 1000)}=${T(cp * vp / 1000)}\ \text{mol}` },
            { title: "Massa do soluto puro", tex: r`m=n\cdot M=${T(cp * vp / 1000)}\times${T(M, 5)}=${T(cp * vp / 1000 * M)}\ \text{g}` },
            { title: "Correção pela pureza", tex: r`m=\frac{${T(cp * vp / 1000 * M)}}{${T(pur / 100)}}=${T((cp * vp / 1000 * M) / (pur / 100))}\ \text{g}` },
            { title: "Na bancada", text: `Pese em balança analítica, dissolva em ~${Math.round(vp * 0.6)} mL de água, transfira quantitativamente para balão de ${vp} mL e complete até a marca.` },
          ]} />
        </div>
      )}
      {mode === "reag" && (
        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Reagente concentrado" value={reag} onChange={setReag} options={REAGENTS.map((x) => ({ value: x.name, label: `${x.name} (d = ${fix(x.d, 2)})` }))} />
            <NumField label="Concentração desejada" value={ct} onChange={setCt} unit="mol/L" />
            <NumField label="Volume final" value={vt} onChange={setVt} unit="mL" />
          </div>
          <Grid cols={2}>
            <Stat label="Molaridade do concentrado" value={fix(cR, 2)} unit="mol/L" />
            <Stat label="Volume a medir" value={fix((ct * vt) / cR, 2)} unit="mL" tone="brand" big />
          </Grid>
          <Steps steps={[
            { title: "Molaridade do comercial", tex: r`c=\frac{1000\,d\,w}{M}=\frac{1000\times${T(R.d)}\times${T(R.pct / 100)}}{${T(mm(R.formula), 5)}}=${T(cR)}\ \text{M}` },
            { title: "Diluição", tex: r`V_1=\frac{${T(ct)}\times${T(vt)}}{${T(cR)}}=${T((ct * vt) / cR)}\ \text{mL}` },
            { title: "Segurança", text: "Adicione o ácido concentrado sobre a água, em capela, sob agitação." },
          ]} />
        </div>
      )}
    </Card>
  );
}

/* =============================== pH =============================== */
function PhCalc() {
  const [mode, setMode] = useState<"forte" | "fraco" | "tampao" | "mistura">("fraco");
  const [C, setC] = useState(0.1);
  const [kind, setKind] = useState<"acid" | "base">("acid");
  const [wid, setWid] = useState("acetic");
  const [ca, setCa] = useState(0.1), [cb, setCb] = useState(0.1);
  const [mix, setMix] = useState<{ id: string; C: number }[]>([{ id: "phosphoric", C: 0.05 }]);
  const [na, setNa] = useState(0.06), [cl, setCl] = useState(0);
  const e = getWeak(wid);
  const content = (() => {
    if (mode === "forte") {
      const pH = kind === "acid" ? pHStrongAcid(C) : pHStrongBase(C);
      const steps: Step[] = kind === "acid"
        ? [{ title: "Ionização completa", tex: r`[\text{H}^+]\approx c=${T(C)}\Rightarrow\text{pH}=${fix(-log10(C), 3).replace(",", "{,}")}` }, { title: "Correção pela água (exata)", tex: r`[\text{H}^+]=\frac{c+\sqrt{c^2+4K_w}}{2}=${T(10 ** -pH)}`, result: `pH = ${fix(pH, 3)}` }]
        : [{ title: "pOH", tex: r`[\text{OH}^-]=${T(C)}\Rightarrow\text{pOH}=${fix(-log10(C), 3).replace(",", "{,}")}` }, { title: "pH (exato)", result: `pH = ${fix(pH, 3)}` }];
      return { pH, steps };
    }
    if (mode === "fraco") {
      const isB = e.kind === "base";
      const K = isB ? KW / 10 ** -e.pKa[0] : 10 ** -e.pKa[0];
      const res = isB ? pHWeakBase(C, K) : pHWeakAcid(C, K);
      const exact = solvePH({ weak: [{ name: e.name, pKa: e.pKa, z: e.z, C }], cations: 0, anions: 0 });
      return {
        pH: exact,
        steps: [
          { title: isB ? "Kb do par conjugado" : "Ka", tex: isB ? r`K_b=K_w/K_a=${T(K)}` : r`K_a=10^{-${String(e.pKa[0]).replace(".", "{,}")}}=${T(K)}` },
          { title: "Aproximação x ≈ √(Kc)", tex: r`x\approx\sqrt{${T(K)}\times${T(C)}}=${T(Math.sqrt(K * C))}\Rightarrow\text{pH}\approx${fix(res.approx, 3).replace(",", "{,}")}` },
          { title: "Equação quadrática", tex: r`x=\frac{-K+\sqrt{K^2+4Kc}}{2}=${T(res.x)}\Rightarrow\text{pH}=${fix(res.pH, 3).replace(",", "{,}")}`, text: `Ionização: ${fix(res.ionization, 2)} % ${res.ionization < 5 ? "(aproximação válida)" : "(use a quadrática)"}` },
          { title: "Balanço de carga completo (todas as etapas e a água)", result: `pH exato = ${fix(exact, 3)}` },
        ] as Step[],
      };
    }
    if (mode === "tampao") {
      const pKa = e.pKa[0];
      const hh = hendersonHasselbalch(pKa, cb, ca);
      const exact = solvePH(e.kind === "ácido" ? { weak: [{ name: e.name, pKa: e.pKa, z: e.z, C: ca + cb }], cations: cb, anions: 0 } : { weak: [{ name: e.name, pKa: e.pKa, z: e.z, C: ca + cb }], cations: 0, anions: ca });
      return {
        pH: exact,
        steps: [
          { title: "Henderson-Hasselbalch", tex: r`\text{pH}=${String(pKa).replace(".", "{,}")}+\log\frac{${T(cb)}}{${T(ca)}}=${fix(hh, 3).replace(",", "{,}")}` },
          { title: "Capacidade tamponante", tex: r`\beta=${T(bufferCapacity(ca + cb, pKa, hh), 3)}\ \text{mol L}^{-1}\text{pH}^{-1}` },
          { title: "Valor exato (balanço de carga)", result: `pH = ${fix(exact, 3)}` },
        ] as Step[],
      };
    }
    const weak: WeakSystem[] = mix.map((m) => { const w = getWeak(m.id); return { name: w.name, pKa: w.pKa, z: w.z, C: m.C }; });
    const pH = solvePH({ weak, cations: na, anions: cl });
    return { pH, steps: [{ title: "Balanço de carga", tex: r`[\text{H}^+]+[\text{Na}^+]+\sum c_i\bar z_i=[\text{OH}^-]+[\text{Cl}^-]` }, { title: "Resolvido numericamente (bisseção)", result: `pH = ${fix(pH, 3)}` }] as Step[] };
  })();
  return (
    <Card>
      <Segmented value={mode} onChange={setMode} options={[{ value: "forte", label: "Forte" }, { value: "fraco", label: "Fraco" }, { value: "tampao", label: "Tampão" }, { value: "mistura", label: "Mistura qualquer (exato)" }]} />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {mode === "forte" && <Select label="Tipo" value={kind} onChange={setKind} options={[{ value: "acid", label: "Ácido forte (HCl, HNO₃)" }, { value: "base", label: "Base forte (NaOH, KOH)" }]} />}
        {(mode === "fraco" || mode === "tampao") && <Select label="Sistema" value={wid} onChange={setWid} options={WEAK_LIBRARY.filter((w) => mode === "fraco" || w.pKa.length === 1).map((w) => ({ value: w.id, label: `${w.name} (pKa ${w.pKa.map((k) => fix(k, 2)).join("; ")})` }))} />}
        {(mode === "forte" || mode === "fraco") && <NumField label="Concentração" value={C} onChange={setC} unit="mol/L" />}
        {mode === "tampao" && <><NumField label={e.kind === "ácido" ? "[HA] ácido" : "[BH⁺] (sal)"} value={ca} onChange={setCa} unit="M" /><NumField label={e.kind === "ácido" ? "[A⁻] (sal)" : "[B] base"} value={cb} onChange={setCb} unit="M" /></>}
      </div>
      {mode === "mistura" && (
        <div className="space-y-2">
          {mix.map((m, i) => (
            <div key={i} className="grid items-end gap-2 sm:grid-cols-[2fr_1fr_auto]">
              <Select label={`Componente ${i + 1}`} value={m.id} onChange={(v) => setMix(mix.map((x, j) => (j === i ? { ...x, id: v } : x)))} options={WEAK_LIBRARY.map((w) => ({ value: w.id, label: `${w.name} (${w.formula})` }))} />
              <NumField label="c (M)" value={m.C} onChange={(v) => setMix(mix.map((x, j) => (j === i ? { ...x, C: v } : x)))} />
              <Button variant="ghost" onClick={() => setMix(mix.filter((_, j) => j !== i))}>Remover</Button>
            </div>
          ))}
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="Na⁺ (de NaOH/sais)" value={na} onChange={setNa} unit="M" />
            <NumField label="Cl⁻ (de HCl/sais)" value={cl} onChange={setCl} unit="M" />
            <div className="flex items-end"><Button onClick={() => setMix([...mix, { id: "acetic", C: 0.01 }])}>+ Componente</Button></div>
          </div>
          <Callout kind="info">Ex.: NaH₂PO₄ 0,05 M → ácido fosfórico 0,05 M + Na⁺ 0,05 M. Na₂HPO₄ → Na⁺ 0,10 M. NH₄Cl → amônia + Cl⁻.</Callout>
        </div>
      )}
      <Result>
        <Grid cols={3}>
          <Stat label="pH" value={fix(content.pH, 2)} tone="brand" big />
          <Stat label="[H⁺]" value={fmt(10 ** -content.pH, 3)} unit="M" />
          <Stat label="[OH⁻]" value={fmt(10 ** (content.pH - 14), 3)} unit="M" />
        </Grid>
        <Steps steps={content.steps} />
      </Result>
    </Card>
  );
}

/* =============================== Solubilidade =============================== */
function SolubilityCalc() {
  const [salt, setSalt] = useState(KSP[0].formula);
  const [cM, setCM] = useState(0), [cX, setCX] = useState(0);
  const s0 = KSP.find((k) => k.formula === salt)!;
  const [a] = s0.cation, [b] = s0.anion;
  const s = solubility(s0.Ksp, a, b, cM, cX);
  const sw = solubility(s0.Ksp, a, b);
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select label="Sal" value={salt} onChange={setSalt} options={KSP.map((k) => ({ value: k.formula, label: `${k.formula} — Kps ${fmt(k.Ksp, 2)}` }))} />
        <NumField label="Cátion comum já presente" value={cM} onChange={setCM} unit="M" />
        <NumField label="Ânion comum já presente" value={cX} onChange={setCX} unit="M" />
      </div>
      <Result>
        <Grid cols={3}>
          <Stat label="Solubilidade molar s" value={fmt(s, 3)} unit="mol/L" tone="brand" big />
          <Stat label="Em água pura" value={fmt(sw, 3)} unit="mol/L" />
          <Stat label="Redução pelo íon comum" value={`${fmt(sw / s, 3)}×`} />
        </Grid>
        <Steps steps={[
          { title: "Equilíbrio", text: `${s0.formula}(s) ⇌ ${a} cátion + ${b} ânion` },
          { title: "Kps", tex: r`K_{ps}=(${a}s+${T(cM)})^{${a}}(${b}s+${T(cX)})^{${b}}=${T(s0.Ksp, 3)}` },
          { title: "Solução numérica", result: `s = ${fmt(s, 3)} mol/L` },
          { title: "Em massa", text: `Massa dissolvida por litro depende da massa molar do sal; ex.: AgCl (143,32 g/mol) → ${fmt(s * 143.32 * 1000, 3)} mg/L se fosse AgCl.` },
        ]} />
      </Result>
    </Card>
  );
}

/* =============================== Titulação (teor) =============================== */
function TitrationCalc() {
  const [ct, setCt] = useState(0.1), [vt, setVt] = useState(24.5), [ra, setRa] = useState(1), [rt, setRt] = useState(1);
  const [M, setM] = useState(204.22), [ms, setMs] = useState(0.5), [aliq, setAliq] = useState(1);
  const [vBlank, setVBlank] = useState(0);
  const n = ct * ((vt - vBlank) / 1000) * (ra / rt) * aliq;
  const m = n * M;
  return (
    <Card>
      <p className="mb-3 text-sm text-muted">Reação genérica: <b>a</b> Analito + <b>t</b> Titulante → produtos. Inclui correção do branco e fator de alíquota.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumField label="c(titulante)" value={ct} onChange={setCt} unit="mol/L" />
        <NumField label="V gasto" value={vt} onChange={setVt} unit="mL" />
        <NumField label="V do branco" value={vBlank} onChange={setVBlank} unit="mL" />
        <NumField label="Coef. a (analito)" value={ra} onChange={setRa} />
        <NumField label="Coef. t (titulante)" value={rt} onChange={setRt} />
        <NumField label="M(analito)" value={M} onChange={setM} unit="g/mol" />
        <NumField label="Massa da amostra" value={ms} onChange={setMs} unit="g" />
        <NumField label="Fator de alíquota (V balão/V alíquota)" value={aliq} onChange={setAliq} />
      </div>
      <Result>
        <Grid cols={3}>
          <Stat label="n(analito)" value={fmt(n, 4)} unit="mol" />
          <Stat label="m(analito)" value={fmt(m, 4)} unit="g" />
          <Stat label="Teor" value={fix((100 * m) / ms, 2)} unit="% m/m" tone="brand" big />
        </Grid>
        <Steps steps={[
          { title: "Mols de titulante", tex: r`n_t=${T(ct)}\times\frac{${T(vt)}-${T(vBlank)}}{1000}=${T(ct * (vt - vBlank) / 1000)}\ \text{mol}` },
          { title: "Estequiometria e alíquota", tex: r`n_a=n_t\cdot\frac{a}{t}\cdot f=${T(n)}\ \text{mol}` },
          { title: "Massa e teor", tex: r`\%=\frac{${T(n)}\times${T(M)}}{${T(ms)}}\times100=${T((100 * m) / ms)}\%` },
        ]} />
      </Result>
    </Card>
  );
}

/* =============================== Gravimetria =============================== */
function GravimetryCalc() {
  const [an, setAn] = useState("Fe"), [pp, setPp] = useState("Fe2O3"), [ka, setKa] = useState(2), [kp, setKp] = useState(1);
  const [mp, setMp] = useState(0.2546), [ms, setMs] = useState(0.5);
  let fg = NaN;
  try { fg = (ka * mm(an)) / (kp * mm(pp)); } catch { /* inválido */ }
  const presets = [["Fe", "Fe2O3", 2, 1], ["Cl", "AgCl", 1, 1], ["SO4", "BaSO4", 1, 1], ["Mg", "Mg2P2O7", 2, 1], ["Ni", "Ni(C4H7N2O2)2", 1, 1], ["Fe3O4", "Fe2O3", 2, 3], ["Ca", "CaC2O4·H2O", 1, 1], ["Al", "Al2O3", 2, 1]] as const;
  return (
    <Card>
      <div className="mb-3 flex flex-wrap gap-1.5">{presets.map((p) => <button key={p[0] + p[1]} onClick={() => { setAn(p[0]); setPp(p[1]); setKa(p[2]); setKp(p[3]); }} className="rounded-lg border border-line px-2 py-1 text-xs hover:border-brand">{prettyFormula(p[0])} ← {prettyFormula(p[1])}</button>)}</div>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <label className="block"><span className="mb-1 block text-[13px] font-medium text-muted">Analito</span><input className="h-10 w-full rounded-xl border border-line bg-surface px-3 font-mono" value={an} onChange={(e) => setAn(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-[13px] font-medium text-muted">Precipitado pesado</span><input className="h-10 w-full rounded-xl border border-line bg-surface px-3 font-mono" value={pp} onChange={(e) => setPp(e.target.value)} /></label>
        <NumField label="a (analito)" value={ka} onChange={setKa} />
        <NumField label="b (precipitado)" value={kp} onChange={setKp} />
        <NumField label="m precipitado" value={mp} onChange={setMp} unit="g" />
        <NumField label="m amostra" value={ms} onChange={setMs} unit="g" />
      </div>
      <Result>
        <Grid cols={3}>
          <Stat label="Fator gravimétrico" value={fix(fg, 5)} />
          <Stat label="m analito" value={fix(mp * fg, 5)} unit="g" />
          <Stat label="Teor" value={fix((100 * mp * fg) / ms, 2)} unit="%" tone="brand" big />
        </Grid>
        {isFinite(fg) && <Steps steps={[
          { title: "Fator gravimétrico", tex: r`\text{FG}=\frac{${ka}\times M(\text{${an}})}{${kp}\times M(\text{${pp.replace(/·/g, "\\cdot ")}})}=\frac{${ka}\times${T(mm(an), 5)}}{${kp}\times${T(mm(pp), 5)}}=${T(fg, 5)}` },
          { title: "Massa de analito", tex: r`m=${T(mp)}\times${T(fg, 5)}=${T(mp * fg)}\ \text{g}` },
          { title: "Teor", tex: r`\%=\frac{${T(mp * fg)}}{${T(ms)}}\times100=${T((100 * mp * fg) / ms)}\%` },
        ]} />}
      </Result>
    </Card>
  );
}

/* =============================== Estatística =============================== */
function StatsCalc() {
  const [txt, setTxt] = useState("10,08\n10,11\n10,09\n10,10\n10,12\n10,07");
  const [conf, setConf] = useState("0.95");
  const xs = parseList(txt);
  const ok = xs.length >= 2;
  const ci = ok ? confidenceInterval(xs, Number(conf)) : null;
  return (
    <Card>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <label className="block">
          <span className="mb-1 block text-[13px] font-medium text-muted">Dados (um por linha ou separados por ;)</span>
          <textarea className="num h-56 w-full rounded-xl border border-line bg-surface p-3 font-mono text-sm" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <Segmented className="mt-2" value={conf} onChange={setConf} options={[{ value: "0.9", label: "90 %" }, { value: "0.95", label: "95 %" }, { value: "0.99", label: "99 %" }]} />
        </label>
        {ci ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Stat label="n" value={ci.n} />
              <Stat label="Média" value={fmt(ci.mean, 6)} tone="brand" />
              <Stat label="s" value={fmt(ci.s, 3)} />
              <Stat label="DPR (CV)" value={fix(ci.rsd, 2)} unit="%" />
              <Stat label="Mediana" value={fmt(ci.median, 6)} />
              <Stat label="Amplitude" value={fmt(ci.range, 3)} />
              <Stat label={`t (${Math.round(Number(conf) * 100)} %, ${ci.n - 1} GL)`} value={fix(ci.t, 3)} />
              <Stat label="Semiamplitude IC" value={fmt(ci.half, 3)} />
            </div>
            <Callout kind="ok" title="Resultado">μ = {fmt(ci.mean, 5)} ± {fmt(ci.half, 2)} ({Math.round(Number(conf) * 100)} % de confiança, n = {ci.n})</Callout>
            <Steps startOpen={false} steps={[
              { title: "Média", tex: r`\bar x=\frac{\sum x_i}{n}=${T(ci.mean, 6)}` },
              { title: "Desvio padrão", tex: r`s=\sqrt{\frac{\sum(x_i-\bar x)^2}{n-1}}=${T(ci.s, 4)}` },
              { title: "Intervalo de confiança", tex: r`\mu=\bar x\pm\frac{ts}{\sqrt n}=${T(ci.mean, 6)}\pm\frac{${T(ci.t, 4)}\times${T(ci.s, 4)}}{\sqrt{${ci.n}}}` },
            ]} />
            <Button size="sm" onClick={() => downloadCSV(xs.map((x, i) => ({ i: i + 1, valor: x, desvio: x - ci.mean })), "dados-estatistica")}>Exportar dados (CSV)</Button>
          </div>
        ) : <Callout kind="info">Digite ao menos 2 valores.</Callout>}
      </div>
    </Card>
  );
}

/* =============================== Testes =============================== */
function TestsCalc() {
  const [mode, setMode] = useState<"q" | "g" | "tref" | "t2" | "tp" | "f">("q");
  const [a, setA] = useState("12,47\n12,42\n12,51\n12,46\n12,84");
  const [bTxt, setBTxt] = useState("12,58\n12,61\n12,55\n12,63\n12,57");
  const [mu, setMu] = useState(12.5);
  const [conf, setConf] = useState<"90" | "95" | "99">("95");
  const A = parseList(a), B = parseList(bTxt);
  const cf = Number(conf) / 100;
  const out = (() => {
    try {
      if (mode === "q") {
        if (A.length < 3 || A.length > 10) return <Callout kind="info">O teste Q (tabela de Dixon) vale para 3 ≤ n ≤ 10.</Callout>;
        const q = qTest(A, Number(conf) as 90 | 95 | 99);
        return <Verdict ok={!q.reject} stats={[["Suspeito", fmt(q.suspect, 5)], ["Q calc", fix(q.Q, 3)], ["Q crít", fix(q.Qcrit, 3)]]} yes={`Q > Qcrít: rejeitar ${fmt(q.suspect, 5)}`} no={`Q < Qcrít: manter ${fmt(q.suspect, 5)}`} tex={r`Q=\frac{${T(q.gap)}}{${T(q.range)}}=${T(q.Q, 3)}`} />;
      }
      if (mode === "g") {
        const g = grubbs(A, 1 - cf);
        return <Verdict ok={!g.reject} stats={[["Suspeito", fmt(g.suspect, 5)], ["G calc", fix(g.G, 3)], ["G crít", fix(g.Gcrit, 3)]]} yes={`G > Gcrít: rejeitar ${fmt(g.suspect, 5)}`} no={`G < Gcrít: manter ${fmt(g.suspect, 5)}`} tex={r`G=\frac{|${T(g.suspect)}-${T(g.mean)}|}{${T(g.s)}}=${T(g.G, 3)}`} />;
      }
      if (mode === "tref") {
        const t = tTestReference(A, mu, cf);
        return <Verdict ok={!t.significant} stats={[["Média", fmt(t.mean, 5)], ["t calc", fix(t.t, 3)], ["t crít", fix(t.tcrit, 3)], ["p", fmt(t.p, 3)]]} yes="Diferença significativa: há erro sistemático" no="Diferença não significativa" tex={r`t=\frac{|${T(t.mean)}-${T(mu)}|\sqrt{${t.n}}}{${T(t.s)}}=${T(t.t, 3)}`} />;
      }
      if (mode === "t2") {
        const t = tTestTwo(A, B, cf);
        return <Verdict ok={!t.significant} stats={[["F calc / crít", `${fix(t.f.F, 2)} / ${fix(t.f.Fcrit, 2)}`], ["Método", t.method], ["t calc", fix(t.t, 3)], ["t crít", fix(t.tcrit, 3)], ["GL", fix(t.df, 1)], ["p", fmt(t.p, 3)]]} yes="As médias diferem significativamente" no="As médias não diferem significativamente" tex={t.sPooled ? r`s_{agr}=${T(t.sPooled)};\ t=\frac{|${T(t.a.mean)}-${T(t.b.mean)}|}{s_{agr}}\sqrt{\frac{${t.a.n}\cdot${t.b.n}}{${t.a.n}+${t.b.n}}}=${T(t.t, 3)}` : r`t=\frac{|\bar x_1-\bar x_2|}{\sqrt{s_1^2/n_1+s_2^2/n_2}}=${T(t.t, 3)}`} />;
      }
      if (mode === "tp") {
        if (A.length !== B.length) return <Callout kind="bad">Os dois conjuntos precisam ter o mesmo número de valores (pares).</Callout>;
        const t = tTestPaired(A, B, cf);
        return <Verdict ok={!t.significant} stats={[["d̄", fmt(t.dMean, 4)], ["s_d", fmt(t.sd, 3)], ["t calc", fix(t.t, 3)], ["t crít", fix(t.tcrit, 3)]]} yes="Os métodos diferem significativamente" no="Os métodos não diferem significativamente" tex={r`t=\frac{|\bar d|\sqrt n}{s_d}=${T(t.t, 3)}`} />;
      }
      const f = fTest(A, B, 1 - cf);
      return <Verdict ok={!f.significant} stats={[["F calc", fix(f.F, 3)], ["F crít (bilateral)", fix(f.Fcrit, 3)], ["GL", `${f.d1}, ${f.d2}`], ["p", fmt(f.p, 3)]]} yes="As precisões diferem significativamente" no="As precisões não diferem significativamente" tex={r`F=\frac{s_1^2}{s_2^2}=${T(f.F, 3)}`} />;
    } catch {
      return <Callout kind="bad">Dados insuficientes.</Callout>;
    }
  })();
  const needsB = mode === "t2" || mode === "tp" || mode === "f";
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={mode} onChange={setMode} options={[{ value: "q", label: "Q (Dixon)" }, { value: "g", label: "Grubbs" }, { value: "tref", label: "t × referência" }, { value: "t2", label: "t duas médias" }, { value: "tp", label: "t pareado" }, { value: "f", label: "F" }]} />
        <Segmented value={conf} onChange={setConf} options={[{ value: "90", label: "90 %" }, { value: "95", label: "95 %" }, { value: "99", label: "99 %" }]} />
      </div>
      <div className={`mt-4 grid gap-4 ${needsB ? "md:grid-cols-[180px_180px_1fr]" : "md:grid-cols-[200px_1fr]"}`}>
        <label className="block"><span className="mb-1 block text-[13px] font-medium text-muted">{needsB ? "Conjunto A" : "Dados"}</span><textarea className="h-48 w-full rounded-xl border border-line bg-surface p-3 font-mono text-sm" value={a} onChange={(e) => setA(e.target.value)} /></label>
        {needsB && <label className="block"><span className="mb-1 block text-[13px] font-medium text-muted">Conjunto B</span><textarea className="h-48 w-full rounded-xl border border-line bg-surface p-3 font-mono text-sm" value={bTxt} onChange={(e) => setBTxt(e.target.value)} /></label>}
        <div className="space-y-3">
          {mode === "tref" && <NumField label="Valor de referência (μ)" value={mu} onChange={setMu} className="max-w-xs" />}
          {out}
        </div>
      </div>
    </Card>
  );
}
function Verdict({ ok, stats, yes, no, tex }: { ok: boolean; stats: [string, string][]; yes: string; no: string; tex: string }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">{stats.map(([l, v]) => <Stat key={l} label={l} value={v} />)}</div>
      <Callout kind={ok ? "ok" : "warn"} title="Conclusão">{ok ? no : yes}</Callout>
      <div className="rounded-xl bg-surface-2 px-3 py-1"><Tex block>{tex}</Tex></div>
    </div>
  );
}

/* =============================== Propagação =============================== */
function PropagationCalc() {
  const [mode, setMode] = useState<"add" | "mul">("mul");
  const [rows, setRows] = useState([{ x: 0.5012, s: 0.0002, label: "m (g)", pow: 1 }, { x: 204.22, s: 0.01, label: "M (g/mol)", pow: -1 }, { x: 0.02453, s: 0.00003, label: "V (L)", pow: -1 }]);
  const y = mode === "add" ? rows.reduce((acc, r0) => acc + r0.pow * r0.x, 0) : rows.reduce((acc, r0) => acc * r0.x ** r0.pow, 1);
  const sy = mode === "add" ? propAdd(rows.map((r0) => r0.s)) : propMul(y, rows.map((r0) => ({ x: r0.x, s: Math.abs(r0.pow) * r0.s })));
  const contrib = rows.map((r0) => (mode === "add" ? r0.s ** 2 : ((r0.pow * r0.s) / r0.x) ** 2));
  const tot = contrib.reduce((a, b) => a + b, 0);
  const pal = usePalette();
  return (
    <div className="space-y-4">
      <Card>
        <Segmented value={mode} onChange={setMode} options={[{ value: "mul", label: "Produto/quociente (y = Π xᵢ^pᵢ)" }, { value: "add", label: "Soma/subtração (y = Σ ±xᵢ)" }]} />
        <div className="mt-4 space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_100px_auto]">
              <label className="block"><span className="mb-1 block text-[13px] font-medium text-muted">Nome</span><input className="h-10 w-full rounded-xl border border-line bg-surface px-3" value={row.label} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} /></label>
              <NumField label="Valor" value={row.x} onChange={(v) => setRows(rows.map((x, j) => (j === i ? { ...x, x: v } : x)))} />
              <NumField label="Incerteza (±)" value={row.s} onChange={(v) => setRows(rows.map((x, j) => (j === i ? { ...x, s: v } : x)))} />
              <NumField label={mode === "add" ? "Sinal (±1)" : "Expoente"} value={row.pow} onChange={(v) => setRows(rows.map((x, j) => (j === i ? { ...x, pow: v } : x)))} />
              <Button variant="ghost" onClick={() => setRows(rows.filter((_, j) => j !== i))}>×</Button>
            </div>
          ))}
          <Button size="sm" onClick={() => setRows([...rows, { x: 1, s: 0.01, label: `x${rows.length + 1}`, pow: 1 }])}>+ variável</Button>
        </div>
        <Result>
          <Grid cols={3}>
            <Stat label="y" value={fmt(y, 6)} tone="brand" />
            <Stat label="s_y (absoluta)" value={fmt(sy, 2)} />
            <Stat label="s_y/y (relativa)" value={fix((100 * sy) / Math.abs(y), 3)} unit="%" />
          </Grid>
          <Callout kind="ok">Resultado: y = {fmt(y, 5)} ± {fmt(sy, 2)}</Callout>
        </Result>
      </Card>
      <ChartCard title="Contribuição de cada variável para a incerteza" data={rows.map((row, i) => ({ variavel: row.label, contribuicao_pct: +(100 * contrib[i] / tot).toFixed(2) }))} csvName="orcamento-incerteza" height={220}>
        <ResponsiveContainer>
          <BarChart data={rows.map((row, i) => ({ name: row.label, pct: (100 * contrib[i]) / tot }))} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid stroke={pal.grid} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} {...axisProps(pal)} unit="%" />
            <YAxis type="category" dataKey="name" {...axisProps(pal)} width={90} />
            <Tooltip {...tooltipStyle(pal)} formatter={(v) => `${fix(Number(v), 1)} %`} />
            <Bar dataKey="pct" fill={pal.brand} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* =============================== Atividade =============================== */
function ActivityCalc() {
  const [ions, setIons] = useState([{ c: 0.01, z: 2, a: 600, n: "Mg²⁺" }, { c: 0.01, z: -2, a: 400, n: "SO₄²⁻" }]);
  const mu = ionicStrength(ions);
  return (
    <Card>
      <div className="space-y-2">
        {ions.map((ion, i) => (
          <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <label className="block"><span className="mb-1 block text-[13px] font-medium text-muted">Íon</span><input className="h-10 w-full rounded-xl border border-line bg-surface px-3" value={ion.n} onChange={(e) => setIons(ions.map((x, j) => (j === i ? { ...x, n: e.target.value } : x)))} /></label>
            <NumField label="c (M)" value={ion.c} onChange={(v) => setIons(ions.map((x, j) => (j === i ? { ...x, c: v } : x)))} />
            <NumField label="carga z" value={ion.z} onChange={(v) => setIons(ions.map((x, j) => (j === i ? { ...x, z: v } : x)))} />
            <NumField label="α (pm)" value={ion.a} onChange={(v) => setIons(ions.map((x, j) => (j === i ? { ...x, a: v } : x)))} />
            <Button variant="ghost" onClick={() => setIons(ions.filter((_, j) => j !== i))}>×</Button>
          </div>
        ))}
        <Button size="sm" onClick={() => setIons([...ions, { c: 0.01, z: 1, a: 300, n: "Cl⁻" }])}>+ íon</Button>
      </div>
      <Result>
        <Stat label="Força iônica μ" value={fmt(mu, 4)} unit="M" tone="brand" big />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted"><th className="py-1.5">Íon</th><th>γ (Debye-Hückel est.)</th><th>γ (Davies)</th><th>atividade</th></tr></thead>
            <tbody>{ions.map((ion, i) => { const g = activityCoefficient(ion.z, mu, ion.a); return <tr key={i} className="border-t border-line"><td className="py-1.5">{ion.n}</td><td className="num">{fix(g, 3)}</td><td className="num">{fix(daviesGamma(ion.z, mu), 3)}</td><td className="num">{fmt(g * ion.c, 3)} M</td></tr>; })}</tbody>
          </table>
        </div>
        <Steps startOpen={false} steps={[{ title: "Força iônica", tex: r`\mu=\tfrac12\sum c_iz_i^2=${T(mu)}` }, { title: "Debye-Hückel estendida", tex: r`\log\gamma=\frac{-0{,}51z^2\sqrt\mu}{1+\alpha\sqrt\mu/305}` }]} />
      </Result>
    </Card>
  );
}

/* =============================== Nernst =============================== */
function NernstCalc() {
  const [cat, setCat] = useState(STANDARD_POTENTIALS.find((p) => p.half.startsWith("Cu²⁺"))!.half);
  const [an, setAn] = useState(STANDARD_POTENTIALS.find((p) => p.half.startsWith("Zn²⁺"))!.half);
  const [n, setN] = useState(2);
  const [Q, setQ] = useState(0.1);
  const c = STANDARD_POTENTIALS.find((p) => p.half === cat)!, a = STANDARD_POTENTIALS.find((p) => p.half === an)!;
  const E0 = c.E0 - a.E0;
  const E = nernst(E0, n, Q);
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="Cátodo (redução)" value={cat} onChange={setCat} options={STANDARD_POTENTIALS.map((p) => ({ value: p.half, label: `${p.half}  (${fix(p.E0, 3)} V)` }))} />
        <Select label="Ânodo (oxidação)" value={an} onChange={setAn} options={STANDARD_POTENTIALS.map((p) => ({ value: p.half, label: `${p.half}  (${fix(p.E0, 3)} V)` }))} />
        <NumField label="Elétrons transferidos n" value={n} onChange={setN} />
        <NumField label="Quociente de reação Q" value={Q} onChange={setQ} />
      </div>
      <Result>
        <Grid cols={4}>
          <Stat label="E°cel" value={fix(E0, 3)} unit="V" />
          <Stat label="E (Nernst)" value={fix(E, 4)} unit="V" tone={E > 0 ? "ok" : "bad"} big />
          <Stat label="ΔG" value={fix(deltaG(n, E), 1)} unit="kJ/mol" sub={E > 0 ? "espontânea" : "não espontânea"} />
          <Stat label="log K" value={fix(logKfromE(n, E0), 1)} />
        </Grid>
        <Steps steps={[
          { title: "Potencial padrão da célula", tex: r`E^\circ=E^\circ_\text{cát}-E^\circ_\text{ân}=${T(c.E0)}-(${T(a.E0)})=${T(E0)}\ \text{V}` },
          { title: "Equação de Nernst (25 °C)", tex: r`E=E^\circ-\frac{0{,}05916}{${n}}\log(${T(Q)})=${T(E)}\ \text{V}` },
          { title: "Energia livre", tex: r`\Delta G=-nFE=-${n}\times96485\times${T(E)}=${T(deltaG(n, E) * 1000)}\ \text{J/mol}` },
        ]} />
      </Result>
    </Card>
  );
}

/* =============================== Beer =============================== */
function BeerCalc() {
  const [mode, setMode] = useState<"simples" | "mistura">("simples");
  const [eps, setEps] = useState(11100), [b, setB] = useState(1), [A, setA] = useState(0.45);
  const [e1, setE1] = useState([4000, 500]), [e2, setE2] = useState([300, 3000]), [Am, setAm] = useState([0.62, 0.48]);
  const mix = twoComponent(Am[0], Am[1], e1[0], e1[1], e2[0], e2[1], b);
  return (
    <Card>
      <Segmented value={mode} onChange={setMode} options={[{ value: "simples", label: "Lei de Beer" }, { value: "mistura", label: "Mistura de 2 componentes" }]} />
      {mode === "simples" ? (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <NumField label="ε" value={eps} onChange={setEps} unit="L mol⁻¹ cm⁻¹" />
            <NumField label="b" value={b} onChange={setB} unit="cm" />
            <NumField label="Absorbância" value={A} onChange={setA} />
          </div>
          <Result>
            <Grid cols={3}>
              <Stat label="c = A/(εb)" value={fmt(A / (eps * b), 4)} unit="mol/L" tone="brand" big />
              <Stat label="%T" value={fix(100 * 10 ** -A, 2)} unit="%" />
              <Stat label="Faixa ótima?" value={A >= 0.15 && A <= 1 ? "Sim" : "Não"} tone={A >= 0.15 && A <= 1 ? "ok" : "bad"} />
            </Grid>
            <Steps steps={[{ title: "Beer-Lambert", tex: r`c=\frac{A}{\varepsilon b}=\frac{${T(A)}}{${T(eps)}\times${T(b)}}=${T(A / (eps * b))}\ \text{mol/L}` }, { title: "Transmitância", tex: r`T=10^{-A}=${T(10 ** -A)}` }]} />
          </Result>
        </>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <NumField label="ε X em λ₁" value={e1[0]} onChange={(v) => setE1([v, e1[1]])} />
            <NumField label="ε Y em λ₁" value={e1[1]} onChange={(v) => setE1([e1[0], v])} />
            <NumField label="A em λ₁" value={Am[0]} onChange={(v) => setAm([v, Am[1]])} />
            <NumField label="ε X em λ₂" value={e2[0]} onChange={(v) => setE2([v, e2[1]])} />
            <NumField label="ε Y em λ₂" value={e2[1]} onChange={(v) => setE2([e2[0], v])} />
            <NumField label="A em λ₂" value={Am[1]} onChange={(v) => setAm([Am[0], v])} />
          </div>
          <Result>
            <Grid cols={2}>
              <Stat label="[X]" value={fmt(mix.cX, 4)} unit="mol/L" tone="brand" />
              <Stat label="[Y]" value={fmt(mix.cY, 4)} unit="mol/L" tone="brand" />
            </Grid>
            <Steps steps={[{ title: "Sistema linear", tex: r`\begin{cases}A_1=\varepsilon_{X1}bc_X+\varepsilon_{Y1}bc_Y\\A_2=\varepsilon_{X2}bc_X+\varepsilon_{Y2}bc_Y\end{cases}` }, { title: "Determinante", tex: r`D=b^2(\varepsilon_{X1}\varepsilon_{Y2}-\varepsilon_{Y1}\varepsilon_{X2})=${T(mix.det)}` }]} />
          </Result>
        </>
      )}
    </Card>
  );
}

/* =============================== Cromatografia =============================== */
function ChromaCalc() {
  const [tM, setTM] = useState(1.2), [t1, setT1] = useState(6.4), [t2, setT2] = useState(7.1), [w1, setW1] = useState(0.42), [w2, setW2] = useState(0.45), [L, setL] = useState(25);
  const k1 = retentionFactor(t1, tM), k2 = retentionFactor(t2, tM), al = selectivity(t2, t1, tM);
  const N2 = plates(t2, w2), Rs = resolution(t1, t2, w1, w2);
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <NumField label="tM" value={tM} onChange={setTM} unit="min" />
        <NumField label="tR₁" value={t1} onChange={setT1} unit="min" />
        <NumField label="tR₂" value={t2} onChange={setT2} unit="min" />
        <NumField label="w₁ (base)" value={w1} onChange={setW1} unit="min" />
        <NumField label="w₂ (base)" value={w2} onChange={setW2} unit="min" />
        <NumField label="L coluna" value={L} onChange={setL} unit="cm" />
      </div>
      <Result>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Stat label="k₁ / k₂" value={`${fix(k1, 2)} / ${fix(k2, 2)}`} />
          <Stat label="α" value={fix(al, 3)} />
          <Stat label="N (pico 2)" value={Math.round(N2).toLocaleString("pt-BR")} />
          <Stat label="H = L/N" value={fmt((L * 10) / N2, 3)} unit="mm" />
          <Stat label="Rs" value={fix(Rs, 2)} tone={Rs >= 1.5 ? "ok" : "bad"} big />
          <Stat label="Rs (Purnell)" value={fix(purnell(N2, al, k2), 2)} />
          <Stat label="L p/ Rs = 1,5" value={fix(L * (1.5 / Rs) ** 2, 1)} unit="cm" />
          <Stat label="N (w½ = w/1,7)" value={Math.round(platesHalf(t2, w2 / 1.699)).toLocaleString("pt-BR")} />
        </div>
        <Steps startOpen={false} steps={[
          { title: "Fatores de retenção", tex: r`k=\frac{t_R-t_M}{t_M}:\ k_1=${T(k1)},\ k_2=${T(k2)}` },
          { title: "Seletividade", tex: r`\alpha=k_2/k_1=${T(al)}` },
          { title: "Pratos", tex: r`N=16\left(\frac{t_R}{w}\right)^2=${T(N2, 4)}` },
          { title: "Resolução", tex: r`R_s=\frac{2(t_{R2}-t_{R1})}{w_1+w_2}=${T(Rs)}` },
        ]} />
      </Result>
    </Card>
  );
}

export const CALCS: CalcDef[] = [
  { id: "matematica", title: "Matemática essencial", desc: "Algarismos significativos, escala p, regra de três", icon: Hash, level: 0, el: () => <MathCalc /> },
  { id: "massa-molar", title: "Massa molar", desc: "Parser de fórmulas, hidratos e composição %", icon: Atom, level: 1, el: () => <MolarMassCalc /> },
  { id: "solucoes", title: "Soluções", desc: "Conversões, diluição, preparo, reagentes comerciais", icon: Beaker, level: 1, el: () => <SolutionsCalc /> },
  { id: "titulacao", title: "Teor por titulação", desc: "Estequiometria, branco e alíquota", icon: TestTube, level: 1, el: () => <TitrationCalc /> },
  { id: "estatistica", title: "Estatística descritiva", desc: "Média, s, DPR e intervalo de confiança", icon: BarChart3, level: 2, el: () => <StatsCalc /> },
  { id: "testes", title: "Testes Q, Grubbs, t e F", desc: "Outliers, comparação de médias e precisões", icon: Sigma, level: 2, el: () => <TestsCalc /> },
  { id: "propagacao", title: "Propagação de incertezas", desc: "Orçamento de incerteza com gráfico", icon: Gauge, level: 2, el: () => <PropagationCalc /> },
  { id: "atividade", title: "Força iônica e atividade", desc: "Debye-Hückel e Davies", icon: Sparkles, level: 3, el: () => <ActivityCalc /> },
  { id: "ph", title: "pH exato", desc: "Forte, fraco, tampão e misturas quaisquer", icon: Droplets, level: 3, el: () => <PhCalc /> },
  { id: "solubilidade", title: "Solubilidade e Kps", desc: "Inclui efeito do íon comum", icon: FlaskRound, level: 3, el: () => <SolubilityCalc /> },
  { id: "gravimetria", title: "Gravimetria", desc: "Fator gravimétrico e teor", icon: Scale, level: 4, el: () => <GravimetryCalc /> },
  { id: "nernst", title: "Nernst e células", desc: "E, ΔG e K de equilíbrio", icon: Zap, level: 5, el: () => <NernstCalc /> },
  { id: "beer", title: "Lei de Beer", desc: "Concentração e misturas de 2 componentes", icon: Waves, level: 5, el: () => <BeerCalc /> },
  { id: "cromatografia", title: "Cromatografia", desc: "k, α, N, H e Rs", icon: Calculator, level: 5, el: () => <ChromaCalc /> },
];

export default function Calculators() {
  const { id } = useParams();
  const calc = useMemo(() => CALCS.find((c) => c.id === id), [id]);
  if (calc) {
    return (
      <div className="space-y-5">
        <Link to="/calculadoras" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Calculadoras</Link>
        <PageHeader kicker={<span style={{ color: `var(--l${calc.level})` }}>Nível {calc.level}</span>} title={calc.title} subtitle={calc.desc} />
        {calc.el()}
      </div>
    );
  }
  return (
    <div>
      <PageHeader kicker="Ferramentas" title="Calculadoras com passo a passo" subtitle="Cada resultado vem com a resolução detalhada, no formato que o professor espera ver na prova." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CALCS.map((c) => (
          <Link key={c.id} to={`/calculadoras/${c.id}`} className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand/50">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl text-white transition-transform group-hover:scale-110" style={{ background: `var(--l${c.level})` }}><c.icon className="size-5" /></div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-semibold">{c.title} <Badge>N{c.level}</Badge></div>
              <div className="text-sm text-muted">{c.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

