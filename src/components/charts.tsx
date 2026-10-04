import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, FileImage, FileSpreadsheet } from "lucide-react";
import { Card, Button } from "./ui";
import { downloadCSV, downloadPNG, downloadSVG } from "../lib/export";

export interface Palette {
  ink: string;
  muted: string;
  grid: string;
  surface: string;
  brand: string;
  ok: string;
  bad: string;
  warn: string;
  series: string[];
  levels: string[];
}

function read(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (n: string) => css.getPropertyValue(n).trim();
  const levels = ["--l0", "--l1", "--l2", "--l3", "--l4", "--l5"].map(v);
  return {
    ink: v("--ink"),
    muted: v("--muted"),
    grid: v("--chart-grid"),
    surface: v("--surface"),
    brand: v("--brand"),
    ok: v("--ok"),
    bad: v("--bad"),
    warn: v("--warn"),
    series: [v("--brand"), levels[4], levels[2], levels[1], levels[5], levels[3], levels[0]],
    levels,
  };
}

/** Cores reais (resolvidas) para os gráficos — reage à troca de tema claro/escuro. */
export function usePalette(): Palette {
  const [p, setP] = useState<Palette>(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setP(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return p;
}

/** Props comuns para eixos Recharts. */
export function axisProps(p: Palette) {
  return {
    stroke: p.grid,
    tick: { fill: p.muted, fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: p.grid },
  } as const;
}

export function tooltipStyle(p: Palette) {
  return {
    contentStyle: { background: p.surface, border: `1px solid ${p.grid}`, borderRadius: 10, fontSize: 13, color: p.ink },
    labelStyle: { color: p.muted, fontWeight: 600 },
    itemStyle: { color: p.ink },
  } as const;
}

/** Cartão de gráfico com botões de exportação PNG / SVG / CSV. */
export function ChartCard({ title, subtitle, children, data, csvName, extraActions, className, height = 320 }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; data?: Record<string, unknown>[]; csvName?: string; extraActions?: ReactNode; className?: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const name = csvName ?? (typeof title === "string" ? title : "grafico");
  return (
    <Card
      className={className}
      title={title}
      subtitle={subtitle}
      actions={
        <>
          {extraActions}
          <Button size="sm" variant="ghost" title="Baixar imagem PNG" onClick={() => downloadPNG(ref.current, name, typeof title === "string" ? title : undefined)}>
            <FileImage className="size-4" /> PNG
          </Button>
          <Button size="sm" variant="ghost" title="Baixar vetor SVG" onClick={() => downloadSVG(ref.current, name)}>
            <Download className="size-4" /> SVG
          </Button>
          {data && (
            <Button size="sm" variant="ghost" title="Baixar dados em CSV (Excel)" onClick={() => downloadCSV(data, name)}>
              <FileSpreadsheet className="size-4" /> CSV
            </Button>
          )}
        </>
      }
    >
      <div ref={ref} style={{ height }} className="w-full min-w-0">
        {children}
      </div>
    </Card>
  );
}
