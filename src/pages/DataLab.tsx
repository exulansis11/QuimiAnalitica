import { useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, ErrorBar, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, BarChart, Legend } from "recharts";
import { FileUp, Printer } from "lucide-react";
import { Button, Callout, Card, PageHeader, Segmented, Stat } from "../components/ui";
import { ChartCard, axisProps, tooltipStyle, usePalette } from "../components/charts";
import { fix, fmt, tCrit } from "../engine/math";
import { confidenceInterval, grubbs, inversePredict, linreg, lodLoq, parseList, parsePairs, qTest, standardAddition, tTestTwo } from "../engine/stats";
import { downloadCSV, parseCSV, pickFile } from "../lib/export";

function DataBox({ label, value, onChange, rows = 10, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  const load = async () => {
    const f = await pickFile(".csv,.txt,.tsv");
    if (!f) return;
    const m = parseCSV(f.text).filter((r) => r.some((c) => c !== "" && isFinite(Number(c.replace(",", ".")))));
    onChange(m.map((r) => r.join("\t")).join("\n"));
  };
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <button onClick={load} className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"><FileUp className="size-3.5" /> Importar CSV</button>
      </div>
      <textarea rows={rows} placeholder={placeholder} className="w-full rounded-xl border border-line bg-surface p-3 font-mono text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/* ============================ Calibração ============================ */
function Calibration() {
  const pal = usePalette();
  const [mode, setMode] = useState<"externa" | "adicao">("externa");
  const [txt, setTxt] = useState("0\t0,002\n1,0\t0,118\n2,0\t0,231\n4,0\t0,465\n6,0\t0,690\n8,0\t0,921\n10,0\t1,140");
  const [unk, setUnk] = useState("0,402\n0,398\n0,405");
  const [blank, setBlank] = useState("");
  const [unit, setUnit] = useState("mg/L");
  const { x, y } = parsePairs(txt);
  const ok = x.length >= 3;
  const reg = ok ? linreg(x, y) : null;
  const unkList = parseList(unk);
  const yU = unkList.length ? unkList.reduce((a, b) => a + b, 0) / unkList.length : NaN;
  const pred = reg && isFinite(yU) ? inversePredict(reg, yU, unkList.length) : null;
  const sBlank = parseList(blank);
  const sForLod = sBlank.length >= 3 ? confidenceInterval(sBlank).s : reg?.syx ?? NaN;
  const lim = reg ? lodLoq(sForLod, reg.slope) : null;
  const sa = mode === "adicao" && ok ? standardAddition(x, y) : null;

  const xmax = Math.max(...x, 0);
  const xmin = mode === "adicao" && sa ? -sa.C * 1.15 : 0;
  const fitLine = reg ? [{ x: xmin, fit: reg.predict(xmin) }, { x: xmax, fit: reg.predict(xmax) }] : [];
  const pts = x.map((v, i) => ({ x: v, y: y[i] }));
  const resid = reg ? x.map((v, i) => ({ x: v, res: reg.residuals[i] })) : [];
  const tc = reg ? tCrit(0.95, reg.n - 2) : NaN;

  const exportAll = () =>
    reg &&
    downloadCSV(
      [
        ...x.map((v, i) => ({ tipo: "padrão", x: v, y: y[i], y_ajustado: reg.predict(v), residuo: reg.residuals[i] })),
        ...unkList.map((v) => ({ tipo: "amostra", y: v, x: (v - reg.intercept) / reg.slope })),
        { tipo: "inclinação", x: reg.slope, y: reg.sm },
        { tipo: "intercepto", x: reg.intercept, y: reg.sb },
        { tipo: "R²", x: reg.r2 },
        { tipo: "s_y/x", x: reg.syx },
        { tipo: "LOD", x: lim?.lod },
        { tipo: "LOQ", x: lim?.loq },
      ],
      "calibracao-resultados",
      ["tipo", "x", "y", "y_ajustado", "residuo"]
    );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <Card title="Dados">
          <div className="space-y-3">
            <Segmented value={mode} onChange={setMode} options={[{ value: "externa", label: "Padronização externa" }, { value: "adicao", label: "Adição de padrão" }]} />
            <DataBox label={mode === "externa" ? "Padrões: concentração ⟶ sinal" : "Conc. adicionada ⟶ sinal"} value={txt} onChange={setTxt} />
            {mode === "externa" && <DataBox label="Sinais da amostra (réplicas)" value={unk} onChange={setUnk} rows={3} />}
            {mode === "externa" && <DataBox label="Brancos (opcional, para LOD)" value={blank} onChange={setBlank} rows={3} placeholder="0,0021\n0,0018\n…" />}
            <label className="block"><span className="mb-1 block text-[13px] font-medium text-muted">Unidade de concentração</span><input className="h-10 w-full rounded-xl border border-line bg-surface px-3" value={unit} onChange={(e) => setUnit(e.target.value)} /></label>
          </div>
        </Card>
        <div className="min-w-0 space-y-5">
          {reg ? (
            <>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <Stat label="Inclinação m ± s" value={`${fmt(reg.slope, 4)} ± ${fmt(reg.sm, 2)}`} />
                <Stat label="Intercepto b ± s" value={`${fmt(reg.intercept, 3)} ± ${fmt(reg.sb, 2)}`} />
                <Stat label="R²" value={fix(reg.r2, 5)} tone={reg.r2 > 0.995 ? "ok" : "bad"} />
                <Stat label="s_y/x" value={fmt(reg.syx, 3)} />
                {mode === "externa" && lim && <Stat label={`LOD (${sBlank.length >= 3 ? "brancos" : "s_y/x"})`} value={fmt(lim.lod, 3)} unit={unit} />}
                {mode === "externa" && lim && <Stat label="LOQ" value={fmt(lim.loq, 3)} unit={unit} />}
                {mode === "externa" && pred && <Stat label="Amostra (IC 95 %)" value={`${fmt(pred.x, 4)} ± ${fmt(pred.half, 2)}`} unit={unit} tone="brand" />}
                {sa && <Stat label="Concentração (adição de padrão)" value={`${fmt(sa.C, 4)} ± ${fmt(tc * sa.sC, 2)}`} unit={unit} tone="brand" />}
              </div>
              {mode === "externa" && pred && (pred.x < Math.min(...x) || pred.x > Math.max(...x)) && <Callout kind="warn">A amostra está fora da faixa da curva — dilua ou acrescente padrões. Extrapolação não é aceita em validação.</Callout>}
              <ChartCard title={mode === "externa" ? "Curva analítica" : "Adição de padrão"} subtitle={`y = ${fmt(reg.slope, 4)}x ${reg.intercept >= 0 ? "+" : "−"} ${fmt(Math.abs(reg.intercept), 3)}`} data={pts.map((p) => ({ x: p.x, y: p.y }))} csvName="curva-pontos" height={320} extraActions={<Button size="sm" variant="soft" onClick={exportAll}>Exportar resultados</Button>}>
                <ResponsiveContainer>
                  <ComposedChart margin={{ top: 8, right: 16, bottom: 12, left: 4 }}>
                    <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="x" type="number" domain={[xmin, "auto"]} {...axisProps(pal)} label={{ value: `concentração (${unit})`, position: "insideBottom", offset: -6, fill: pal.muted, fontSize: 12 }} tickFormatter={(v) => fmt(v, 3)} />
                    <YAxis {...axisProps(pal)} width={48} tickFormatter={(v) => fmt(v, 3)} />
                    <Tooltip {...tooltipStyle(pal)} formatter={(v) => fmt(Number(v), 4)} />
                    <Line data={fitLine} dataKey="fit" stroke={pal.muted} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                    <Scatter data={pts} dataKey="y" fill={pal.brand} />
                    {mode === "externa" && pred && <Scatter data={[{ x: pred.x, y: yU }]} dataKey="y" fill={pal.warn} shape="diamond" />}
                    {mode === "adicao" && <ReferenceLine y={0} stroke={pal.muted} />}
                    {mode === "adicao" && sa && <ReferenceLine x={-sa.C} stroke={pal.warn} strokeDasharray="4 4" label={{ value: "−c(amostra)", fill: pal.warn, fontSize: 11, position: "top" }} />}
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Resíduos" subtitle="Devem estar distribuídos aleatoriamente em torno de zero" data={resid} csvName="residuos" height={220}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
                    <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="x" type="number" {...axisProps(pal)} tickFormatter={(v) => fmt(v, 3)} />
                    <YAxis dataKey="res" {...axisProps(pal)} width={56} tickFormatter={(v) => fmt(v, 2)} />
                    <Tooltip {...tooltipStyle(pal)} formatter={(v) => fmt(Number(v), 3)} />
                    <ReferenceLine y={0} stroke={pal.muted} />
                    <ReferenceLine y={2 * reg.syx} stroke={pal.warn} strokeDasharray="3 3" />
                    <ReferenceLine y={-2 * reg.syx} stroke={pal.warn} strokeDasharray="3 3" />
                    <Scatter data={resid} fill={pal.series[1]} />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          ) : (
            <Callout kind="info">Cole ao menos 3 pares x / y (separados por tab, ponto e vírgula ou espaço). Vírgula decimal é aceita.</Callout>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================ Estatística de grupos ============================ */
function Groups() {
  const pal = usePalette();
  const [txt, setTxt] = useState("Método A\tMétodo B\tMétodo C\n10,12\t10,25\t10,08\n10,09\t10,31\t10,15\n10,15\t10,22\t10,02\n10,11\t10,28\t10,11\n10,08\t10,27\t10,20");
  const groups = useMemo(() => {
    const rows = txt.trim().split(/\n/).map((l) => l.split(/[\t;]+/).map((c) => c.trim()));
    if (!rows.length) return [];
    const hasHeader = rows[0].some((c) => c !== "" && !isFinite(Number(c.replace(",", "."))));
    const header = hasHeader ? rows[0] : rows[0].map((_, i) => `Grupo ${i + 1}`);
    const body = hasHeader ? rows.slice(1) : rows;
    return header.map((name, j) => ({ name, xs: body.map((r) => Number((r[j] ?? "").replace(",", "."))).filter((v) => isFinite(v)) }));
  }, [txt]);
  const stats = groups.filter((g) => g.xs.length >= 2).map((g) => ({ name: g.name, ...confidenceInterval(g.xs), q: g.xs.length >= 3 && g.xs.length <= 10 ? qTest(g.xs) : null, g: g.xs.length >= 3 ? grubbs(g.xs) : null }));
  const chart = stats.map((s) => ({ name: s.name, mean: s.mean, err: s.half }));
  const pairs = stats.length >= 2 ? stats.slice(1).map((s) => ({ a: stats[0].name, b: s.name, r: tTestTwo(groups.find((g) => g.name === stats[0].name)!.xs, groups.find((g) => g.name === s.name)!.xs) })) : [];
  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <Card title="Dados por coluna">
        <DataBox label="Uma coluna por grupo (1ª linha = nomes)" value={txt} onChange={setTxt} rows={12} />
      </Card>
      <div className="min-w-0 space-y-5">
        <Card title="Resumo estatístico" actions={<Button size="sm" variant="soft" onClick={() => downloadCSV(stats.map((s) => ({ grupo: s.name, n: s.n, media: s.mean, s: s.s, "DPR %": s.rsd, "IC95 ±": s.half, Grubbs_suspeito: s.g?.suspect, Grubbs_rejeita: s.g?.reject ? "sim" : "não" })), "estatistica-grupos")}>Exportar CSV</Button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted"><th className="py-1.5">Grupo</th><th>n</th><th>Média</th><th>s</th><th>DPR</th><th>IC 95 %</th><th>Outlier (Grubbs)</th></tr></thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.name} className="border-t border-line">
                    <td className="py-1.5 font-medium">{s.name}</td><td className="num">{s.n}</td><td className="num">{fmt(s.mean, 5)}</td><td className="num">{fmt(s.s, 3)}</td><td className="num">{fix(s.rsd, 2)} %</td><td className="num">± {fmt(s.half, 2)}</td>
                    <td>{s.g ? (s.g.reject ? <span className="text-bad">rejeitar {fmt(s.g.suspect, 4)}</span> : <span className="text-ok">nenhum</span>) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <ChartCard title="Médias com IC 95 %" data={chart.map((c) => ({ grupo: c.name, media: c.mean, ic95: c.err }))} csvName="medias-ic" height={280}>
          <ResponsiveContainer>
            <BarChart data={chart} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
              <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" {...axisProps(pal)} />
              <YAxis {...axisProps(pal)} width={56} domain={["auto", "auto"]} tickFormatter={(v) => fmt(v, 4)} />
              <Tooltip {...tooltipStyle(pal)} formatter={(v) => fmt(Number(v), 5)} />
              <Bar dataKey="mean" fill={pal.brand} fillOpacity={0.75} radius={[6, 6, 0, 0]} maxBarSize={70}>
                <ErrorBar dataKey="err" width={10} stroke={pal.ink} strokeWidth={1.5} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        {pairs.length > 0 && (
          <Card title={`Comparação com "${pairs[0].a}" (teste F + t, 95 %)`}>
            <div className="space-y-2">
              {pairs.map((p) => (
                <div key={p.b} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                  <b>{p.a} × {p.b}</b>
                  <span>F = {fix(p.r.f.F, 2)} ({p.r.f.significant ? "precisões diferem" : "precisões equivalentes"})</span>
                  <span>· t = {fix(p.r.t, 2)} (crít. {fix(p.r.tcrit, 2)}, {p.r.method})</span>
                  <span className={p.r.significant ? "font-semibold text-bad" : "font-semibold text-ok"}>{p.r.significant ? "médias diferem" : "médias equivalentes"}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ============================ Titulação experimental ============================ */
function TitrationData() {
  const pal = usePalette();
  const [txt, setTxt] = useState("0\t2,88\n5\t4,15\n10\t4,57\n15\t4,93\n20\t5,36\n22\t5,61\n23\t5,78\n24\t6,08\n24,5\t6,40\n24,8\t6,87\n25\t8,72\n25,2\t10,30\n25,5\t10,75\n26\t11,04\n27\t11,35\n30\t11,75\n35\t12,05");
  const [ylab, setYlab] = useState("pH");
  const { x, y } = parsePairs(txt);
  const n = x.length;
  const d1 = [] as { V: number; d1: number }[];
  for (let i = 0; i < n - 1; i++) d1.push({ V: (x[i] + x[i + 1]) / 2, d1: (y[i + 1] - y[i]) / (x[i + 1] - x[i]) });
  const d2 = [] as { V: number; d2: number }[];
  for (let i = 0; i < d1.length - 1; i++) d2.push({ V: (d1[i].V + d1[i + 1].V) / 2, d2: (d1[i + 1].d1 - d1[i].d1) / (d1[i + 1].V - d1[i].V) });
  // ponto final: cruzamento de zero da 2ª derivada perto do máximo da 1ª
  let ep = NaN;
  if (d1.length) {
    const im = d1.reduce((b, p, i) => (Math.abs(p.d1) > Math.abs(d1[b].d1) ? i : b), 0);
    ep = d1[im].V;
    for (let i = 0; i < d2.length - 1; i++) {
      if (Math.sign(d2[i].d2) !== Math.sign(d2[i + 1].d2) && Math.abs(d2[i].V - d1[im].V) < 2) {
        ep = d2[i].V + ((0 - d2[i].d2) * (d2[i + 1].V - d2[i].V)) / (d2[i + 1].d2 - d2[i].d2);
        break;
      }
    }
  }
  const [Ct, setCt] = useState("0,1000");
  const [Va, setVa] = useState("25,00");
  const cAn = (Number(Ct.replace(",", ".")) * ep) / Number(Va.replace(",", "."));
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card title="Dados da titulação">
        <div className="space-y-3">
          <DataBox label="Volume (mL) ⟶ leitura" value={txt} onChange={setTxt} rows={14} />
          <div className="grid grid-cols-3 gap-2">
            <label className="block"><span className="mb-1 block text-xs text-muted">Leitura</span><input className="h-9 w-full rounded-lg border border-line bg-surface px-2 text-sm" value={ylab} onChange={(e) => setYlab(e.target.value)} /></label>
            <label className="block"><span className="mb-1 block text-xs text-muted">c titulante</span><input className="num h-9 w-full rounded-lg border border-line bg-surface px-2 text-sm" value={Ct} onChange={(e) => setCt(e.target.value)} /></label>
            <label className="block"><span className="mb-1 block text-xs text-muted">V alíquota</span><input className="num h-9 w-full rounded-lg border border-line bg-surface px-2 text-sm" value={Va} onChange={(e) => setVa(e.target.value)} /></label>
          </div>
        </div>
      </Card>
      <div className="min-w-0 space-y-5">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <Stat label="Ponto final (2ª derivada)" value={fix(ep, 2)} unit="mL" tone="brand" big />
          <Stat label="c(analito) se 1:1" value={fmt(cAn, 4)} unit="mol/L" />
          <Stat label="Pontos" value={n} />
        </div>
        <ChartCard title={`Curva ${ylab} × V`} data={x.map((v, i) => ({ V: v, [ylab]: y[i] }))} csvName="titulacao-experimental" height={280}>
          <ResponsiveContainer>
            <LineChart data={x.map((v, i) => ({ V: v, y: y[i] }))} margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
              <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
              <XAxis dataKey="V" type="number" domain={["auto", "auto"]} {...axisProps(pal)} />
              <YAxis {...axisProps(pal)} width={44} domain={["auto", "auto"]} />
              <Tooltip {...tooltipStyle(pal)} />
              {isFinite(ep) && <ReferenceLine x={ep} stroke={pal.warn} strokeDasharray="4 4" label={{ value: `PF ${fix(ep, 2)} mL`, fill: pal.warn, fontSize: 11, position: "insideTopLeft" }} />}
              <Line dataKey="y" name={ylab} stroke={pal.brand} strokeWidth={2.2} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="1ª e 2ª derivadas" subtitle="Máximo de ΔpH/ΔV e cruzamento de zero de Δ²pH/ΔV²" data={d1.map((p, i) => ({ V: p.V, d1: p.d1, d2: d2[i]?.d2 }))} csvName="derivadas" height={260}>
          <ResponsiveContainer>
            <ComposedChart margin={{ top: 8, right: 16, bottom: 8, left: 4 }}>
              <CartesianGrid stroke={pal.grid} strokeDasharray="3 3" />
              <XAxis dataKey="V" type="number" domain={["auto", "auto"]} {...axisProps(pal)} allowDuplicatedCategory={false} />
              <YAxis yAxisId="a" {...axisProps(pal)} width={44} />
              <YAxis yAxisId="b" orientation="right" {...axisProps(pal)} width={44} />
              <Tooltip {...tooltipStyle(pal)} formatter={(v) => fmt(Number(v), 3)} />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine yAxisId="b" y={0} stroke={pal.muted} />
              <Line yAxisId="a" data={d1} dataKey="d1" name="1ª derivada" stroke={pal.brand} strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="b" data={d2} dataKey="d2" name="2ª derivada" stroke={pal.series[1]} strokeWidth={1.6} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export default function DataLab() {
  const [tab, setTab] = useState<"cal" | "grp" | "tit">("cal");
  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Ferramentas"
        title="Laboratório de dados"
        subtitle="Cole ou importe (CSV) os dados das suas aulas práticas. Os resultados, gráficos e tabelas podem ser exportados (CSV/PNG/SVG) ou impressos como relatório em PDF."
        actions={<Button onClick={() => window.print()}><Printer className="size-4" /> Imprimir relatório</Button>}
      />
      <Segmented className="no-print" value={tab} onChange={setTab} options={[{ value: "cal", label: "Curva de calibração" }, { value: "grp", label: "Estatística e comparação" }, { value: "tit", label: "Titulação potenciométrica" }]} />
      {tab === "cal" && <Calibration />}
      {tab === "grp" && <Groups />}
      {tab === "tit" && <TitrationData />}
    </div>
  );
}
