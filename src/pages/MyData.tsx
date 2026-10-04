import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { TOPICS, TOPIC_BY_ID } from "../data/curriculum";
import type { Difficulty, FixedQuestion } from "../data/questions/types";
import { useProgress } from "../store/progress";
import { Badge, Button, Callout, Card, Empty, PageHeader, Stat } from "../components/ui";
import { downloadCSV, downloadJSON, downloadText, parseCSV, pickFile } from "../lib/export";
import { topicTitle } from "../data/questions";

const TEMPLATE = [
  "topico;dificuldade;enunciado;tipo;correta;alternativa2;alternativa3;alternativa4;alternativa5;resposta_numerica;unidade;tolerancia_rel;explicacao",
  "q-acidobase;2;Qual o pH de HCl 0,010 M?;num;;;;;;2;;0,01;pH = −log(0,010) = 2,00",
  "c-complexometria;1;O EDTA forma complexos com metais na proporção:;mcq;1:1;1:2;2:1;1:6;;;;;O EDTA é hexadentado e forma complexos 1:1.",
].join("\r\n");

/** Converte CSV (modelo acima) ou JSON em questões. */
function parseQuestions(name: string, text: string): { qs: FixedQuestion[]; errors: string[] } {
  const errors: string[] = [];
  const qs: FixedQuestion[] = [];
  const stamp = Date.now().toString(36);
  if (name.endsWith(".json")) {
    try {
      const arr = JSON.parse(text);
      (Array.isArray(arr) ? arr : [arr]).forEach((o, i) => {
        if (!o.statement || !TOPIC_BY_ID[o.topic]) return errors.push(`Item ${i + 1}: tópico ou enunciado inválido.`);
        qs.push({ id: `u${stamp}${i}`, topic: o.topic, level: TOPIC_BY_ID[o.topic].level, difficulty: (o.difficulty ?? 2) as Difficulty, kind: o.options ? "mcq" : "num", statement: o.statement, options: o.options, correct: o.correct ?? 0, answer: o.answer, unit: o.unit, tol: o.tol, absTol: o.absTol, explanation: o.explanation, source: o.source ?? "Importada", steps: o.steps ?? [{ title: "Explicação", text: o.explanation ?? "" }] });
      });
    } catch (e) {
      errors.push(`JSON inválido: ${(e as Error).message}`);
    }
    return { qs, errors };
  }
  const rows = parseCSV(text);
  rows.slice(1).forEach((r, i) => {
    const [topic, diff, statement, kind, correct, a2, a3, a4, a5, num, unit, tol, expl] = r;
    if (!TOPIC_BY_ID[topic]) return errors.push(`Linha ${i + 2}: tópico "${topic}" não existe.`);
    if (!statement) return errors.push(`Linha ${i + 2}: enunciado vazio.`);
    if (kind === "num") {
      const ans = Number((num ?? "").replace(",", "."));
      if (!isFinite(ans)) return errors.push(`Linha ${i + 2}: resposta numérica inválida.`);
      qs.push({ id: `u${stamp}${i}`, topic, level: TOPIC_BY_ID[topic].level, difficulty: (Number(diff) || 2) as Difficulty, kind: "num", statement, answer: ans, unit: unit || undefined, tol: Number((tol || "0,02").replace(",", ".")), explanation: expl, source: "Importada", steps: [{ title: "Explicação", text: expl || "—", result: `${num}${unit ? " " + unit : ""}` }] });
    } else {
      const opts = [correct, a2, a3, a4, a5].filter((x) => x && x.trim());
      if (opts.length < 2) return errors.push(`Linha ${i + 2}: múltipla escolha precisa de ao menos 2 alternativas.`);
      qs.push({ id: `u${stamp}${i}`, topic, level: TOPIC_BY_ID[topic].level, difficulty: (Number(diff) || 2) as Difficulty, kind: "mcq", statement, options: opts, correct: 0, explanation: expl, source: "Importada", steps: [{ title: "Explicação", text: expl || "—", result: correct }] });
    }
  });
  return { qs, errors };
}

export default function MyData() {
  const st = useProgress();
  const [msg, setMsg] = useState<{ kind: "ok" | "bad"; text: string } | null>(null);

  const backup = () => {
    const { attempts, exams, visited, studied, studySeconds, customQuestions, theme, name } = useProgress.getState();
    downloadJSON({ app: "QuimiAnalítica", versao: 2, exportado: new Date().toISOString(), attempts, exams, visited, studied, studySeconds, customQuestions, theme, name }, "quimianalitica-backup");
  };
  const restore = async () => {
    const f = await pickFile(".json");
    if (!f) return;
    try {
      const data = JSON.parse(f.text);
      if (data.app !== "QuimiAnalítica") throw new Error("arquivo não é um backup do QuimiAnalítica");
      if (!confirm("Substituir todo o progresso atual pelo backup?")) return;
      st.importBackup(data);
      setMsg({ kind: "ok", text: `Backup restaurado: ${data.attempts?.length ?? 0} tentativas, ${data.exams?.length ?? 0} provas.` });
    } catch (e) {
      setMsg({ kind: "bad", text: `Não foi possível restaurar: ${(e as Error).message}` });
    }
  };
  const importQs = async () => {
    const f = await pickFile(".csv,.json");
    if (!f) return;
    const { qs, errors } = parseQuestions(f.name.toLowerCase(), f.text);
    if (qs.length) st.addCustom(qs);
    setMsg({ kind: errors.length && !qs.length ? "bad" : "ok", text: `${qs.length} questão(ões) importada(s).${errors.length ? ` ${errors.length} problema(s): ${errors.slice(0, 3).join(" ")}` : ""}` });
  };

  return (
    <div className="space-y-5">
      <PageHeader kicker="Dados" title="Meus dados" subtitle="Tudo fica salvo apenas neste navegador. Faça backup, exporte para Excel e importe questões das suas provas e listas." />
      {msg && <Callout kind={msg.kind}>{msg.text}</Callout>}
      <Card title="Perfil">
        <label className="block max-w-sm">
          <span className="mb-1 block text-[13px] font-medium text-muted">Seu nome (aparece na tela inicial)</span>
          <input className="h-10 w-full rounded-xl border border-line bg-surface px-3" value={st.name} onChange={(e) => st.setName(e.target.value)} />
        </label>
      </Card>
      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Backup e restauração">
          <div className="mb-3 grid grid-cols-3 gap-2">
            <Stat label="Tentativas" value={st.attempts.length} />
            <Stat label="Provas" value={st.exams.length} />
            <Stat label="Questões próprias" value={st.customQuestions.length} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={backup}><FileJson className="size-4" /> Baixar backup (JSON)</Button>
            <Button onClick={restore}><Upload className="size-4" /> Restaurar backup</Button>
          </div>
          <p className="mt-2 text-xs text-muted">Use o backup para levar seu progresso para outro computador ou navegador.</p>
        </Card>
        <Card title="Exportar para planilha">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => downloadCSV(st.attempts.map((a) => ({ data: new Date(a.ts).toLocaleString("pt-BR"), modo: a.mode, nivel: a.level, topico: topicTitle(a.topic), dificuldade: a.difficulty, correta: a.correct ? 1 : 0, "tempo (s)": +(a.ms / 1000).toFixed(1) })), "tentativas")}><FileSpreadsheet className="size-4" /> Tentativas</Button>
            <Button onClick={() => downloadCSV(st.exams.map((e) => ({ prova: e.title, inicio: new Date(e.startedAt).toLocaleString("pt-BR"), fim: new Date(e.finishedAt).toLocaleString("pt-BR"), nota: e.grade, acertos: e.correct.filter(Boolean).length, total: e.refs.length })), "provas")}><FileSpreadsheet className="size-4" /> Provas</Button>
            <Button onClick={() => downloadCSV(Object.entries(st.studySeconds).map(([d, s]) => ({ dia: d, minutos: +(s / 60).toFixed(1) })), "tempo-de-estudo")}><FileSpreadsheet className="size-4" /> Tempo de estudo</Button>
          </div>
          <p className="mt-2 text-xs text-muted">CSV com “;” e vírgula decimal — abre direto no Excel e no LibreOffice em português.</p>
        </Card>
      </div>
      <Card title="Importar questões (das suas provas e listas)" subtitle="As questões importadas entram na prática e nas provas, junto com o banco do app." actions={<><Button size="sm" variant="ghost" onClick={() => downloadText("﻿" + TEMPLATE, "modelo-questoes", "csv", "text/csv;charset=utf-8")}><Download className="size-4" /> Modelo CSV</Button><Button size="sm" variant="primary" onClick={importQs}><Upload className="size-4" /> Importar CSV/JSON</Button></>}>
        <details className="mb-3 text-sm">
          <summary className="cursor-pointer font-medium text-brand">Códigos de tópicos aceitos</summary>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">{TOPICS.map((t) => <div key={t.id}><code className="rounded bg-surface-2 px-1">{t.id}</code> — {t.title}</div>)}</div>
        </details>
        {st.customQuestions.length ? (
          <div className="space-y-2">
            {st.customQuestions.map((q) => (
              <div key={q.id} className="flex items-start gap-2 rounded-xl border border-line px-3 py-2 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap gap-1"><Badge>{topicTitle(q.topic)}</Badge><Badge tone="brand">{q.kind === "num" ? "numérica" : "múltipla escolha"}</Badge></div>
                  {q.statement}
                </div>
                <Button size="sm" variant="ghost" onClick={() => st.removeCustom(q.id)} aria-label="Remover"><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
        ) : <Empty>Nenhuma questão importada. Baixe o modelo, preencha no Excel e importe.</Empty>}
      </Card>
      <Card title="Zona de perigo">
        <Button variant="danger" onClick={() => confirm("Apagar TODO o progresso deste navegador? Isso não pode ser desfeito (faça um backup antes).") && st.reset()}><Trash2 className="size-4" /> Apagar todo o progresso</Button>
      </Card>
    </div>
  );
}
