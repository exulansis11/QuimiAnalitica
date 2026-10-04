/**
 * Exportação: CSV (compatível com Excel pt-BR), JSON, SVG/PNG de gráficos e impressão em PDF.
 */

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const slug = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();

const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");

/**
 * CSV com separador ";" e vírgula decimal (abre direto no Excel/LibreOffice em pt-BR).
 * BOM UTF-8 garante acentuação correta.
 */
export function toCSV(rows: Record<string, unknown>[], columns?: string[]): string {
  if (!rows.length) return "";
  const cols = columns ?? Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "number") return isFinite(v) ? String(+v.toPrecision(10)).replace(".", ",") : "";
    const s = String(v);
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(";"), ...rows.map((r) => cols.map((c) => esc(r[c])).join(";"))].join("\r\n");
}

export function downloadCSV(rows: Record<string, unknown>[], name: string, columns?: string[]) {
  download(new Blob(["﻿" + toCSV(rows, columns)], { type: "text/csv;charset=utf-8" }), `${slug(name)}-${stamp()}.csv`);
}

export function downloadJSON(data: unknown, name: string) {
  download(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `${slug(name)}-${stamp()}.json`);
}

export function downloadText(text: string, name: string, ext = "txt", type = "text/plain") {
  download(new Blob([text], { type }), `${slug(name)}-${stamp()}.${ext}`);
}

function serializeSvg(svg: SVGSVGElement): { xml: string; w: number; h: number } {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const { width, height } = svg.getBoundingClientRect();
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  const font = getComputedStyle(document.body).fontFamily;
  clone.setAttribute("style", `font-family:${font}`);
  return { xml: new XMLSerializer().serializeToString(clone), w: width, h: height };
}

export function findSvg(container: HTMLElement | null): SVGSVGElement | null {
  if (!container) return null;
  // maior SVG dentro do contêiner (ignora ícones)
  const svgs = Array.from(container.querySelectorAll("svg")).filter((s) => s.getBoundingClientRect().width > 80);
  return (svgs.sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height)[0] as SVGSVGElement) ?? null;
}

export function downloadSVG(container: HTMLElement | null, name: string) {
  const svg = findSvg(container);
  if (!svg) return;
  const { xml } = serializeSvg(svg);
  download(new Blob([xml], { type: "image/svg+xml" }), `${slug(name)}-${stamp()}.svg`);
}

export async function downloadPNG(container: HTMLElement | null, name: string, title?: string) {
  const svg = findSvg(container);
  if (!svg) return;
  const { xml, w, h } = serializeSvg(svg);
  const scale = 2;
  const pad = title ? 34 : 12;
  const img = new Image();
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Falha ao rasterizar SVG"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = (w + 24) * scale;
  canvas.height = (h + pad + 12) * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  const css = getComputedStyle(document.documentElement);
  ctx.fillStyle = css.getPropertyValue("--surface").trim() || "#fff";
  ctx.fillRect(0, 0, w + 24, h + pad + 12);
  if (title) {
    ctx.fillStyle = css.getPropertyValue("--ink").trim() || "#000";
    ctx.font = `600 15px ${getComputedStyle(document.body).fontFamily}`;
    ctx.fillText(title, 12, 22);
  }
  ctx.drawImage(img, 12, pad, w, h);
  URL.revokeObjectURL(url);
  canvas.toBlob((b) => b && download(b, `${slug(name)}-${stamp()}.png`), "image/png");
}

/** Lê arquivo de texto (CSV/JSON) escolhido pelo usuário. */
export function pickFile(accept: string): Promise<{ name: string; text: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return resolve(null);
      resolve({ name: f.name, text: await f.text() });
    };
    input.click();
  });
}

/** Converte CSV (; ou , ou tab) em matriz de números/strings. */
export function parseCSV(text: string): string[][] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return [];
  const sep = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ",";
  return lines.map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, "")));
}
