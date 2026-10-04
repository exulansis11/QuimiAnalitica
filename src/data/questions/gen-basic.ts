/**
 * Geradores paramétricos — Níveis 0 (Matemática), 1 (Fundamentos) e 2 (Estatística).
 * Cada chamada produz valores novos; a resposta e o passo a passo vêm do motor de cálculo.
 */
import type { Generator } from "./types";
import { N, T, TF, NF, mcq } from "./types";
import { log10, roundSig, tCrit } from "../../engine/math";
import { mm, prettyFormula } from "../../engine/stoich";
import { describe, linreg, qTest, Q_TABLE } from "../../engine/stats";

const r = String.raw;

export const GEN_BASIC: Generator[] = [
  /* ============================ NÍVEL 0 ============================ */
  {
    id: "g-sci-ops",
    topic: "m-cientifica",
    level: 0,
    difficulty: 1,
    title: "Operações em notação científica",
    make: (g) => {
      const a = g.num(1.1, 9.8, 2), m = g.int(-8, 6);
      const b = g.num(1.1, 9.8, 2), n = g.int(-6, 6);
      const c = g.num(1.1, 9.8, 2), p = g.int(-5, 5);
      const res = (a * 10 ** m * (b * 10 ** n)) / (c * 10 ** p);
      return {
        kind: "num",
        statement: r`Calcule $\dfrac{(${T(a, 2)}\times10^{${m}})(${T(b, 2)}\times10^{${n}})}{${T(c, 2)}\times10^{${p}}}$. Responda em notação científica (ex.: 3,2e-5).`,
        answer: res,
        tol: 0.02,
        hint: "Multiplique/divida as mantissas e some/subtraia os expoentes separadamente.",
        steps: [
          { title: "Mantissas", tex: r`\frac{${T(a, 2)}\times${T(b, 2)}}{${T(c, 2)}} = ${T((a * b) / c, 4)}` },
          { title: "Expoentes", tex: r`10^{${m}+(${n})-(${p})}=10^{${m + n - p}}` },
          { title: "Normalize", result: `${N(res, 3)}`, text: "Ajuste para que a mantissa fique entre 1 e 10." },
        ],
      };
    },
  },
  {
    id: "g-sci-root",
    topic: "m-cientifica",
    level: 0,
    difficulty: 2,
    title: "Raiz quadrada de potência",
    make: (g) => {
      const K = g.num(1.1, 9.9, 2) * 10 ** -g.int(4, 12);
      const c = g.pick([0.01, 0.02, 0.05, 0.1, 0.2]);
      const x = Math.sqrt(K * c);
      return {
        kind: "num",
        statement: r`Calcule $x=\sqrt{K\,c}$ para $K=${T(K, 2)}$ e $c=${T(c)}$ (forma usada no pH de ácidos fracos).`,
        answer: x,
        tol: 0.02,
        hint: "Para tirar raiz de 10ⁿ com n ímpar, reescreva como 10ⁿ⁻¹ × 10 antes.",
        steps: [
          { title: "Produto", tex: r`K\,c=${T(K * c, 4)}` },
          { title: "Raiz", tex: r`x=\sqrt{${T(K * c, 4)}}=${T(x, 3)}`, result: N(x) },
        ],
      };
    },
  },
  {
    id: "g-sigfig-count",
    topic: "m-algarismos",
    level: 0,
    difficulty: 1,
    title: "Contagem de algarismos significativos",
    make: (g) => {
      const cases: [string, number][] = [
        ["0,00450", 3], ["12,050", 5], ["1,0080", 5], ["0,0300", 3], ["4,0 × 10⁻³", 2], ["250,0", 4], ["0,1000", 4], ["6,022 × 10²³", 4], ["100,06", 5], ["0,005", 1], ["7,00", 3], ["3,0500", 5],
      ];
      const [s, n] = g.pick(cases);
      return {
        kind: "num",
        statement: `Quantos algarismos significativos há em ${s}?`,
        answer: n,
        absTol: 0,
        hint: "Zeros à esquerda não contam; zeros entre dígitos e à direita da vírgula contam.",
        steps: [
          { title: "Ignore zeros à esquerda", text: "Eles só posicionam a vírgula." },
          { title: "Conte o restante", text: "Inclua zeros intermediários e finais após a vírgula.", result: `${n} algarismos` },
        ],
      };
    },
  },
  {
    id: "g-sigfig-ops",
    topic: "m-algarismos",
    level: 0,
    difficulty: 2,
    title: "Resultado com algarismos corretos",
    make: (g) => {
      const a = g.num(10, 99, 4), b = g.num(1.1, 9.9, 2);
      const prod = a * b;
      const correct = NF(roundSig(prod, 2), Math.max(0, 1 - Math.floor(log10(roundSig(prod, 2)))));
      const opts = mcq(g, correct, [NF(prod, 4).replace(/0+$/, ""), NF(roundSig(prod, 4), 2), NF(roundSig(prod, 3), Math.max(0, 2 - Math.floor(log10(prod))))]);
      return {
        kind: "mcq",
        statement: r`Qual é o resultado de $${T(a, 4)}\times${T(b, 2)}$ expresso com o número correto de algarismos significativos?`,
        ...opts,
        steps: [
          { title: "Regra da multiplicação", text: `O resultado tem tantos significativos quanto o fator menos preciso: ${N(b, 2)} tem 2.` },
          { title: "Produto bruto", tex: r`${T(a, 4)}\times${T(b, 2)}=${T(prod, 6)}` },
          { title: "Arredonde para 2 significativos", result: correct },
        ],
      };
    },
  },
  {
    id: "g-ph-from-h",
    topic: "m-log",
    level: 0,
    difficulty: 1,
    title: "pH a partir de [H⁺]",
    make: (g) => {
      const H = g.num(1.1, 9.9, 2) * 10 ** -g.int(2, 12);
      const pH = -log10(H);
      return {
        kind: "num",
        statement: r`Uma solução tem $[\text{H}^+]=${T(H, 2)}$ mol/L. Qual é o pH?`,
        answer: pH,
        absTol: 0.015,
        hint: "pH = −log[H⁺]; log(a×10ⁿ) = log a + n.",
        steps: [
          { title: "Definição", tex: r`\text{pH}=-\log(${T(H, 2)})` },
          { title: "Separe mantissa e expoente", tex: r`=-(\log ${T(H / 10 ** Math.floor(log10(H)), 2)} + (${Math.floor(log10(H))}))` },
          { title: "Resultado", result: `pH = ${NF(pH, 2)}`, text: "2 significativos em [H⁺] → 2 casas decimais no pH." },
        ],
      };
    },
  },
  {
    id: "g-h-from-ph",
    topic: "m-log",
    level: 0,
    difficulty: 1,
    title: "[OH⁻] a partir do pH",
    make: (g) => {
      const pH = g.num(1, 13, 3);
      const OH = 10 ** -(14 - pH);
      return {
        kind: "num",
        statement: `Uma solução a 25 °C tem pH = ${NF(pH, 2)}. Calcule [OH⁻] em mol/L.`,
        answer: OH,
        tol: 0.03,
        steps: [
          { title: "pOH", tex: r`\text{pOH}=14{,}00-${TF(pH)}=${TF(14 - pH)}` },
          { title: "Antilog", tex: r`[\text{OH}^-]=10^{-${TF(14 - pH)}}=${T(OH)}`, result: `${N(OH)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-log-dilution",
    topic: "m-log",
    level: 0,
    difficulty: 2,
    title: "Variação de pH na diluição",
    make: (g) => {
      const f = g.pick([2, 4, 5, 10, 20, 50, 100]);
      const c = g.pick([0.1, 0.05, 0.01, 0.02]);
      const d = log10(f);
      return {
        kind: "num",
        statement: `Uma solução de HCl ${N(c)} mol/L é diluída ${f} vezes. De quanto aumenta o pH?`,
        answer: d,
        absTol: 0.015,
        hint: "Para ácido forte, [H⁺] cai pelo fator de diluição; ΔpH = log(fator).",
        steps: [
          { title: "Nova concentração", tex: r`c_2=\frac{${T(c)}}{${f}}=${T(c / f)}` },
          { title: "Variação", tex: r`\Delta\text{pH}=\log ${f}=${TF(d)}`, result: `ΔpH = ${NF(d, 2)}` },
        ],
      };
    },
  },
  {
    id: "g-unit-mg-mmol",
    topic: "m-unidades",
    level: 0,
    difficulty: 1,
    title: "mg → mmol",
    make: (g) => {
      const f = g.pick(["NaCl", "KHC8H4O4", "CaCO3", "Na2CO3", "C6H8O6", "AgNO3"]);
      const M = mm(f);
      const mg = g.num(50, 900, 3);
      const n = mg / M;
      return {
        kind: "num",
        statement: `Quantos milimols há em ${N(mg)} mg de ${prettyFormula(f)} (M = ${NF(M, 2)} g/mol)?`,
        answer: n,
        unit: "mmol",
        steps: [
          { title: "Atalho", text: "mg ÷ (g/mol) = mmol, pois mg/mmol = g/mol." },
          { title: "Cálculo", tex: r`n=\frac{${T(mg)}\ \text{mg}}{${TF(M)}\ \text{mg/mmol}}=${T(n)}\ \text{mmol}`, result: `${N(n)} mmol` },
        ],
      };
    },
  },
  {
    id: "g-unit-ppm",
    topic: "m-unidades",
    level: 0,
    difficulty: 2,
    title: "ppm → mol/L",
    make: (g) => {
      const ion = g.pick([["Ca", 40.078], ["Fe", 55.845], ["Pb", 207.2], ["Cu", 63.546], ["Na", 22.99], ["F", 18.998]] as const);
      const ppm = g.num(0.5, 400, 2);
      const c = ppm / 1000 / ion[1];
      return {
        kind: "num",
        statement: `Uma água contém ${N(ppm, 2)} ppm de ${ion[0]}. Expresse em mol/L (M = ${ion[1]} g/mol).`,
        answer: c,
        unit: "mol/L",
        tol: 0.02,
        steps: [
          { title: "ppm em solução aquosa", tex: r`${T(ppm, 2)}\ \text{ppm}=${T(ppm, 2)}\ \text{mg/L}=${T(ppm / 1000, 3)}\ \text{g/L}` },
          { title: "Divida pela massa molar", tex: r`c=\frac{${T(ppm / 1000, 3)}}{${ion[1]}}=${T(c)}\ \text{mol/L}`, result: `${N(c)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-prop-purity",
    topic: "m-proporcao",
    level: 0,
    difficulty: 1,
    title: "Teor percentual",
    make: (g) => {
      const ms = g.num(0.2, 2.5, 4), frac = g.num(0.45, 0.99, 3);
      const ma = ms * frac;
      return {
        kind: "num",
        statement: `Uma amostra de ${NF(ms, 4)} g contém ${NF(ma, 4)} g de analito. Qual o teor (% m/m)?`,
        answer: (100 * ma) / ms,
        unit: "%",
        tol: 0.005,
        steps: [{ title: "Proporção", tex: r`\%=\frac{${TF(ma, 4)}}{${TF(ms, 4)}}\times100=${TF((100 * ma) / ms)}\%`, result: `${NF((100 * ma) / ms, 2)} %` }],
      };
    },
  },
  {
    id: "g-prop-error",
    topic: "m-proporcao",
    level: 0,
    difficulty: 1,
    title: "Erro relativo",
    make: (g) => {
      const v = g.num(10, 100, 4), x = v * (1 + g.num(-0.06, 0.06, 2));
      const e = ((x - v) / v) * 100;
      return {
        kind: "num",
        statement: `Um analista obteve ${NF(x, 2)} mg de vitamina C num comprimido cujo valor verdadeiro é ${NF(v, 2)} mg. Calcule o erro relativo (%) com sinal.`,
        answer: e,
        unit: "%",
        absTol: 0.05,
        steps: [
          { title: "Erro absoluto", tex: r`E=${TF(x)}-${TF(v)}=${TF(x - v)}\ \text{mg}` },
          { title: "Erro relativo", tex: r`E_r=\frac{${TF(x - v)}}{${TF(v)}}\times100=${TF(e)}\%`, result: `${NF(e, 2)} %` },
        ],
      };
    },
  },

  /* ============================ NÍVEL 1 ============================ */
  {
    id: "g-molar-mass",
    topic: "f-mol",
    level: 1,
    difficulty: 1,
    title: "Massa molar",
    make: (g) => {
      const f = g.pick(["K2Cr2O7", "CuSO4·5H2O", "(NH4)2Fe(SO4)2·6H2O", "Na2B4O7·10H2O", "Ca3(PO4)2", "KMnO4", "Mg2P2O7", "Al2(SO4)3", "C6H8O6", "Na2S2O3·5H2O"]);
      const M = mm(f);
      return {
        kind: "num",
        statement: `Calcule a massa molar de ${prettyFormula(f)} (use a tabela periódica).`,
        answer: M,
        unit: "g/mol",
        tol: 0.003,
        steps: [
          { title: "Conte os átomos de cada elemento", text: "Multiplique índices fora de parênteses; some a água de hidratação." },
          { title: "Some as massas atômicas", result: `M = ${NF(M, 2)} g/mol` },
        ],
      };
    },
  },
  {
    id: "g-stoich-mass",
    topic: "f-mol",
    level: 1,
    difficulty: 2,
    title: "Estequiometria: massa de precipitado",
    make: (g) => {
      const mNaCl = g.num(0.1, 0.8, 4);
      const n = mNaCl / mm("NaCl");
      const mAgCl = n * mm("AgCl");
      return {
        kind: "num",
        statement: `Que massa de AgCl precipita quando ${NF(mNaCl, 4)} g de NaCl reagem com excesso de AgNO₃?`,
        answer: mAgCl,
        unit: "g",
        tol: 0.01,
        steps: [
          { title: "Mols de NaCl", tex: r`n=\frac{${TF(mNaCl, 4)}}{58{,}44}=${T(n, 4)}\ \text{mol}` },
          { title: "Estequiometria 1:1", text: "NaCl + AgNO₃ → AgCl + NaNO₃" },
          { title: "Massa de AgCl", tex: r`m=${T(n, 4)}\times143{,}32=${TF(mAgCl, 4)}\ \text{g}`, result: `${NF(mAgCl, 4)} g` },
        ],
      };
    },
  },
  {
    id: "g-conc-gl-mol",
    topic: "f-conc",
    level: 1,
    difficulty: 1,
    title: "Massa dissolvida → mol/L",
    make: (g) => {
      const f = g.pick(["NaOH", "NaCl", "KMnO4", "AgNO3", "Na2CO3", "K2Cr2O7"]);
      const m = g.num(0.5, 12, 3), V = g.pick([100, 250, 500, 1000]);
      const c = m / mm(f) / (V / 1000);
      return {
        kind: "num",
        statement: `Dissolvem-se ${NF(m, 3)} g de ${prettyFormula(f)} em água e completa-se a ${V},0 mL. Qual a concentração em mol/L?`,
        answer: c,
        unit: "mol/L",
        steps: [
          { title: "Mols", tex: r`n=\frac{${T(m)}}{${TF(mm(f))}}=${T(m / mm(f), 4)}\ \text{mol}` },
          { title: "Molaridade", tex: r`c=\frac{${T(m / mm(f), 4)}}{${T(V / 1000, 3)}\ \text{L}}=${T(c, 4)}\ \text{mol/L}`, result: `${N(c, 3)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-conc-commercial",
    topic: "f-conc",
    level: 1,
    difficulty: 2,
    title: "Molaridade de reagente comercial",
    make: (g) => {
      const R = g.pick([
        { n: "HCl", pct: 37, d: 1.19 },
        { n: "H2SO4", pct: 98, d: 1.84 },
        { n: "HNO3", pct: 65, d: 1.4 },
        { n: "H3PO4", pct: 85, d: 1.69 },
        { n: "CH3COOH", pct: 99.7, d: 1.05 },
      ]);
      const M = mm(R.n);
      const c = (1000 * R.d * R.pct) / 100 / M;
      return {
        kind: "num",
        statement: `O ${prettyFormula(R.n)} comercial tem ${NF(R.pct, 1)} % (m/m) e densidade ${NF(R.d, 2)} g/mL. Qual sua concentração em mol/L?`,
        answer: c,
        unit: "mol/L",
        steps: [
          { title: "Massa de 1 L de solução", tex: r`1000\ \text{mL}\times${TF(R.d)}\ \text{g/mL}=${T(1000 * R.d, 4)}\ \text{g}` },
          { title: "Massa de soluto", tex: r`${T(1000 * R.d, 4)}\times${TF(R.pct / 100, 3)}=${T((1000 * R.d * R.pct) / 100, 4)}\ \text{g}` },
          { title: "Mols por litro", tex: r`c=\frac{${T((1000 * R.d * R.pct) / 100, 4)}}{${TF(M)}}=${T(c)}\ \text{mol/L}`, result: `${N(c)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-dil-c1v1",
    topic: "f-diluicao",
    level: 1,
    difficulty: 1,
    title: "C₁V₁ = C₂V₂",
    make: (g) => {
      const c1 = g.pick([12.1, 6.0, 1.0, 0.5, 18.0]), c2 = g.pick([0.1, 0.05, 0.2, 0.01]), V2 = g.pick([100, 250, 500, 1000]);
      const V1 = (c2 * V2) / c1;
      return {
        kind: "num",
        statement: `Que volume (mL) de solução estoque ${N(c1)} mol/L é necessário para preparar ${V2} mL de solução ${N(c2)} mol/L?`,
        answer: V1,
        unit: "mL",
        steps: [
          { title: "Conservação do soluto", tex: r`c_1V_1=c_2V_2\Rightarrow V_1=\frac{${T(c2)}\times${V2}}{${T(c1)}}` },
          { title: "Resultado", result: `${N(V1)} mL` },
        ],
      };
    },
  },
  {
    id: "g-dil-serial",
    topic: "f-diluicao",
    level: 1,
    difficulty: 2,
    title: "Diluição seriada",
    make: (g) => {
      const c0 = g.pick([1000, 500, 100]);
      const a1 = g.pick([1, 2, 5, 10]), v1 = g.pick([50, 100]);
      const a2 = g.pick([1, 2, 5]), v2 = g.pick([25, 50, 100]);
      const cf = (c0 * a1 * a2) / (v1 * v2);
      return {
        kind: "num",
        statement: `Uma solução-padrão de Fe com ${c0} mg/L é diluída: ${a1},00 mL → balão de ${v1},00 mL; depois ${a2},00 mL desta → balão de ${v2},00 mL. Qual a concentração final (mg/L)?`,
        answer: cf,
        unit: "mg/L",
        steps: [
          { title: "1ª diluição", tex: r`c_1=${c0}\times\frac{${a1}}{${v1}}=${T((c0 * a1) / v1)}\ \text{mg/L}` },
          { title: "2ª diluição", tex: r`c_2=${T((c0 * a1) / v1)}\times\frac{${a2}}{${v2}}=${T(cf)}\ \text{mg/L}`, result: `${N(cf)} mg/L` },
        ],
      };
    },
  },
  {
    id: "g-prep-mass",
    topic: "f-diluicao",
    level: 1,
    difficulty: 2,
    title: "Massa a pesar (com pureza)",
    make: (g) => {
      const f = g.pick(["Na2CO3", "KHC8H4O4", "AgNO3", "Na2C2O4", "K2Cr2O7"]);
      const c = g.pick([0.05, 0.1, 0.02, 0.0167]), V = g.pick([250, 500, 1000]), pur = g.num(98.5, 99.95, 4);
      const m = (c * (V / 1000) * mm(f)) / (pur / 100);
      return {
        kind: "num",
        statement: `Quantos gramas de ${prettyFormula(f)} (pureza ${NF(pur, 2)} %) devem ser pesados para preparar ${V} mL de solução ${N(c)} mol/L?`,
        answer: m,
        unit: "g",
        tol: 0.005,
        steps: [
          { title: "Mols necessários", tex: r`n=${T(c)}\times${T(V / 1000)}=${T(c * V / 1000, 4)}\ \text{mol}` },
          { title: "Massa pura", tex: r`m=${T(c * V / 1000, 4)}\times${TF(mm(f))}=${TF(c * V / 1000 * mm(f), 4)}\ \text{g}` },
          { title: "Corrija pela pureza", tex: r`m=\frac{${TF(c * V / 1000 * mm(f), 4)}}{${TF(pur / 100, 4)}}=${TF(m, 4)}\ \text{g}`, result: `${NF(m, 4)} g` },
        ],
      };
    },
  },
  {
    id: "g-std-khp",
    topic: "f-volumetria-calc",
    level: 1,
    difficulty: 2,
    title: "Padronização de NaOH com KHP",
    make: (g) => {
      const mK = g.num(0.35, 0.95, 4), c = g.num(0.085, 0.115, 3);
      const n = mK / 204.22;
      const V = (n / c) * 1000;
      const Vr = +V.toFixed(2);
      const cc = n / (Vr / 1000);
      return {
        kind: "num",
        statement: `${NF(mK, 4)} g de biftalato de potássio (KHP, 204,22 g/mol) consumiram ${NF(Vr, 2)} mL de NaOH até a viragem da fenolftaleína. Qual a concentração do NaOH (mol/L)?`,
        answer: cc,
        unit: "mol/L",
        tol: 0.005,
        steps: [
          { title: "Mols de KHP (monoprótico)", tex: r`n=\frac{${TF(mK, 4)}}{204{,}22}=${T(n, 4)}\ \text{mol}` },
          { title: "Estequiometria 1:1", text: "HP⁻ + OH⁻ → P²⁻ + H₂O" },
          { title: "Concentração", tex: r`c=\frac{${T(n, 4)}}{${T(Vr / 1000, 4)}\ \text{L}}=${T(cc, 4)}`, result: `${N(cc, 4)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-titr-purity-na2co3",
    topic: "f-volumetria-calc",
    level: 1,
    difficulty: 3,
    title: "Pureza de Na₂CO₃ (estequiometria 1:2)",
    make: (g) => {
      const ms = g.num(0.18, 0.3, 4), pur = g.num(0.9, 0.995, 3), c = g.num(0.095, 0.105, 4);
      const n = (ms * pur) / 105.99;
      const V = +((2 * n * 1000) / c).toFixed(2);
      const p = (((c * V) / 1000 / 2) * 105.99 * 100) / ms;
      return {
        kind: "num",
        statement: `Uma amostra de ${NF(ms, 4)} g de barrilha (Na₂CO₃ impuro) foi titulada com HCl ${NF(c, 4)} mol/L até o 2º ponto de equivalência (alaranjado de metila), gastando ${NF(V, 2)} mL. Qual o teor de Na₂CO₃ (% m/m)? (M = 105,99 g/mol)`,
        answer: p,
        unit: "%",
        tol: 0.004,
        hint: "No 2º PE: CO₃²⁻ + 2H⁺ → H₂CO₃.",
        steps: [
          { title: "Mols de HCl", tex: r`n_{\text{HCl}}=${TF(c, 4)}\times${T(V / 1000, 4)}=${T((c * V) / 1000, 4)}\ \text{mol}` },
          { title: "Razão 2:1", tex: r`n_{\text{Na}_2\text{CO}_3}=\frac{n_\text{HCl}}{2}=${T((c * V) / 2000, 4)}\ \text{mol}` },
          { title: "Massa e teor", tex: r`\%=\frac{${T((c * V) / 2000, 4)}\times105{,}99}{${TF(ms, 4)}}\times100=${TF(p)}\%`, result: `${NF(p, 2)} %` },
        ],
      };
    },
  },
  {
    id: "g-back-titration",
    topic: "f-volumetria-calc",
    level: 1,
    difficulty: 3,
    title: "Retrotitulação de CaCO₃",
    make: (g) => {
      const ms = g.num(0.2, 0.4, 4), pur = g.num(0.85, 0.99, 3);
      const cHCl = 0.1, VHCl = 50, cNaOH = g.num(0.095, 0.105, 4);
      const nCa = (ms * pur) / 100.09;
      const nExc = (cHCl * VHCl) / 1000 - 2 * nCa;
      const VN = +((nExc / cNaOH) * 1000).toFixed(2);
      const p = (((cHCl * VHCl) / 1000 - (cNaOH * VN) / 1000) / 2 * 100.09 * 100) / ms;
      return {
        kind: "num",
        statement: `${NF(ms, 4)} g de calcário foram tratados com 50,00 mL de HCl 0,1000 mol/L. Após ferver para eliminar CO₂, o excesso de ácido consumiu ${NF(VN, 2)} mL de NaOH ${NF(cNaOH, 4)} mol/L. Calcule o teor de CaCO₃ (% m/m).`,
        answer: p,
        unit: "%",
        tol: 0.006,
        hint: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂. O que sobrou de HCl foi titulado com NaOH.",
        steps: [
          { title: "HCl total", tex: r`n=0{,}1000\times0{,}05000=5{,}000\times10^{-3}\ \text{mol}` },
          { title: "HCl em excesso", tex: r`n_\text{exc}=${TF(cNaOH, 4)}\times${T(VN / 1000, 4)}=${T((cNaOH * VN) / 1000, 4)}\ \text{mol}` },
          { title: "HCl que reagiu com CaCO₃", tex: r`${T((cHCl * VHCl) / 1000 - (cNaOH * VN) / 1000, 4)}\ \text{mol}\Rightarrow n_{\text{CaCO}_3}=${T(((cHCl * VHCl) / 1000 - (cNaOH * VN) / 1000) / 2, 4)}` },
          { title: "Teor", result: `${NF(p, 2)} %` },
        ],
      };
    },
  },

  /* ============================ NÍVEL 2 ============================ */
  {
    id: "g-stats-s",
    topic: "e-descritiva",
    level: 2,
    difficulty: 1,
    title: "Desvio padrão de réplicas",
    make: (g) => {
      const mu = g.num(5, 50, 3), sd = mu * g.num(0.003, 0.02, 2);
      const xs = Array.from({ length: g.int(4, 6) }, () => +(mu + sd * (g.next() * 3.4 - 1.7)).toFixed(2));
      const d = describe(xs);
      return {
        kind: "num",
        statement: `Réplicas da determinação de ferro (mg/L): ${xs.map((x) => NF(x, 2)).join("; ")}. Calcule o desvio padrão amostral s.`,
        answer: d.s,
        tol: 0.02,
        steps: [
          { title: "Média", tex: r`\bar x=${T(d.mean, 5)}` },
          { title: "Soma dos quadrados dos desvios", tex: r`\sum(x_i-\bar x)^2=${T(d.variance * (d.n - 1), 4)}` },
          { title: "s com n−1", tex: r`s=\sqrt{\frac{${T(d.variance * (d.n - 1), 4)}}{${d.n - 1}}}=${T(d.s, 3)}`, result: `s = ${N(d.s)}` },
        ],
      };
    },
  },
  {
    id: "g-stats-ci",
    topic: "e-descritiva",
    level: 2,
    difficulty: 2,
    title: "Intervalo de confiança 95 %",
    make: (g) => {
      const n = g.int(3, 8), mean = g.num(10, 99, 4), s = g.num(0.05, 0.6, 2);
      const t = tCrit(0.95, n - 1);
      const h = (t * s) / Math.sqrt(n);
      return {
        kind: "num",
        statement: `Em ${n} réplicas obteve-se média ${NF(mean, 2)} % e s = ${NF(s, 2)} %. Calcule a semiamplitude do intervalo de confiança de 95 % (o valor após o ±).`,
        answer: h,
        unit: "%",
        tol: 0.02,
        hint: `Use t de Student com ${n - 1} graus de liberdade.`,
        steps: [
          { title: "t crítico", tex: r`t_{95\%,\,${n - 1}}=${TF(t, 3)}` },
          { title: "Semiamplitude", tex: r`\frac{ts}{\sqrt n}=\frac{${TF(t, 3)}\times${TF(s)}}{\sqrt{${n}}}=${T(h)}` },
          { title: "IC", result: `μ = ${NF(mean, 2)} ± ${N(h, 2)} %` },
        ],
      };
    },
  },
  {
    id: "g-stats-rsd",
    topic: "e-descritiva",
    level: 2,
    difficulty: 1,
    title: "Coeficiente de variação",
    make: (g) => {
      const mean = g.num(0.1, 0.2, 4), s = g.num(0.0005, 0.004, 2);
      return {
        kind: "num",
        statement: `A concentração de um titulante foi ${NF(mean, 4)} mol/L com s = ${N(s, 2)} mol/L. Qual o DPR (CV) em %?`,
        answer: (100 * s) / mean,
        unit: "%",
        steps: [{ title: "DPR", tex: r`\text{CV}=\frac{${T(s, 2)}}{${TF(mean, 4)}}\times100=${T((100 * s) / mean)}\%`, result: `${N((100 * s) / mean)} %` }],
      };
    },
  },
  {
    id: "g-qtest",
    topic: "e-testes",
    level: 2,
    difficulty: 2,
    title: "Teste Q",
    make: (g) => {
      const base = g.num(20, 40, 4);
      const xs = Array.from({ length: g.int(4, 6) }, () => +(base + g.num(-0.12, 0.12, 2)).toFixed(2));
      xs.push(+(base + g.pick([1, -1]) * g.num(0.2, 0.6, 2)).toFixed(2));
      const q = qTest(xs, 95);
      return {
        kind: "num",
        statement: `Resultados (%): ${g.shuffle(xs).map((x) => NF(x, 2)).join("; ")}. Calcule Q para o valor suspeito (Q crítico 95 % para n = ${xs.length}: ${NF(Q_TABLE[95][xs.length], 3)}).`,
        answer: q.Q,
        tol: 0.02,
        steps: [
          { title: "Ordene e identifique o suspeito", text: `Suspeito: ${NF(q.suspect, 2)}` },
          { title: "Q = afastamento / amplitude", tex: r`Q=\frac{${TF(q.gap)}}{${TF(q.range)}}=${TF(q.Q, 3)}` },
          { title: "Decisão", result: q.reject ? `Q > Qcrít → rejeitar ${NF(q.suspect, 2)}` : `Q < Qcrít → manter ${NF(q.suspect, 2)}` },
        ],
      };
    },
  },
  {
    id: "g-ttest-ref",
    topic: "e-testes",
    level: 2,
    difficulty: 3,
    title: "Teste t contra valor certificado",
    make: (g) => {
      const mu = g.num(10, 30, 4), n = g.int(4, 7), s = g.num(0.05, 0.25, 2);
      const mean = +(mu + g.pick([1, -1]) * g.num(0.02, 0.4, 2)).toFixed(3);
      const t = (Math.abs(mean - mu) * Math.sqrt(n)) / s;
      const tc = tCrit(0.95, n - 1);
      return {
        kind: "num",
        statement: `Um material de referência certificado tem ${NF(mu, 2)} % de analito. Um novo método forneceu média ${NF(mean, 3)} %, s = ${NF(s, 2)} % (n = ${n}). Calcule t. (t crítico 95 % = ${NF(tc, 3)})`,
        answer: t,
        tol: 0.02,
        steps: [
          { title: "Estatística t", tex: r`t=\frac{|${TF(mean, 3)}-${TF(mu)}|\sqrt{${n}}}{${TF(s)}}=${TF(t, 2)}` },
          { title: "Conclusão", result: t > tc ? "t > tcrít: há erro sistemático (diferença significativa)" : "t < tcrít: diferença não significativa a 95 %" },
        ],
      };
    },
  },
  {
    id: "g-ftest",
    topic: "e-testes",
    level: 2,
    difficulty: 2,
    title: "Teste F",
    make: (g) => {
      const s1 = g.num(0.05, 0.3, 2), s2 = g.num(0.05, 0.3, 2);
      const F = Math.max(s1, s2) ** 2 / Math.min(s1, s2) ** 2;
      return {
        kind: "num",
        statement: `Dois métodos tiveram s₁ = ${NF(s1, 2)} e s₂ = ${NF(s2, 2)} mg/L. Calcule F para comparar suas precisões.`,
        answer: F,
        tol: 0.02,
        steps: [{ title: "Maior variância no numerador", tex: r`F=\frac{${TF(Math.max(s1, s2))}^2}{${TF(Math.min(s1, s2))}^2}=${TF(F)}`, result: `F = ${NF(F, 2)}` }],
      };
    },
  },
  {
    id: "g-prop-burette",
    topic: "e-propagacao",
    level: 2,
    difficulty: 1,
    title: "Incerteza de volume gasto",
    make: (g) => {
      const vi = g.num(0.1, 1.5, 2), vf = g.num(18, 45, 4), s = g.pick([0.01, 0.02, 0.03]);
      const sv = Math.sqrt(2) * s;
      return {
        kind: "num",
        statement: `Leituras de bureta: inicial ${NF(vi, 2)} mL e final ${NF(vf, 2)} mL, cada uma com incerteza ±${NF(s, 2)} mL. Qual a incerteza do volume gasto?`,
        answer: sv,
        unit: "mL",
        tol: 0.03,
        steps: [
          { title: "Subtração → incertezas absolutas", tex: r`s_V=\sqrt{${TF(s)}^2+${TF(s)}^2}=${TF(sv, 3)}\ \text{mL}` },
          { title: "Resultado", result: `V = ${NF(vf - vi, 2)} ± ${NF(sv, 3)} mL` },
        ],
      };
    },
  },
  {
    id: "g-prop-product",
    topic: "e-propagacao",
    level: 2,
    difficulty: 2,
    title: "Incerteza de concentração",
    make: (g) => {
      const m = g.num(0.4, 0.9, 4), sm = 0.0002, V = g.num(20, 40, 4), sV = 0.03;
      const c = m / 204.22 / (V / 1000);
      const sc = c * Math.sqrt((sm / m) ** 2 + (sV / V) ** 2);
      return {
        kind: "num",
        statement: `c(NaOH) = m(KHP)/(M·V). Com m = ${NF(m, 4)} ± 0,0002 g e V = ${NF(V, 2)} ± 0,03 mL (despreze a incerteza de M), calcule a incerteza absoluta de c.`,
        answer: sc,
        unit: "mol/L",
        tol: 0.04,
        steps: [
          { title: "c", tex: r`c=\frac{${TF(m, 4)}}{204{,}22\times${T(V / 1000, 4)}}=${T(c, 4)}\ \text{mol/L}` },
          { title: "Incertezas relativas", tex: r`\frac{s_c}{c}=\sqrt{\left(\frac{0{,}0002}{${TF(m, 4)}}\right)^2+\left(\frac{0{,}03}{${TF(V)}}\right)^2}=${T(sc / c, 3)}` },
          { title: "Absoluta", result: `s_c = ${N(sc, 2)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-prop-ph",
    topic: "e-propagacao",
    level: 2,
    difficulty: 3,
    title: "Incerteza de [H⁺] a partir do pH",
    make: (g) => {
      const pH = g.num(3, 9, 3), s = g.pick([0.01, 0.02, 0.03]);
      const H = 10 ** -pH;
      const sH = 2.303 * s * H;
      return {
        kind: "num",
        statement: `Um pHmetro indica pH = ${NF(pH, 2)} ± ${NF(s, 2)}. Qual a incerteza relativa (%) de [H⁺]?`,
        answer: 100 * 2.303 * s,
        unit: "%",
        tol: 0.02,
        steps: [
          { title: "Regra do antilog", tex: r`\frac{s_H}{[\text{H}^+]}=2{,}303\,s_\text{pH}=2{,}303\times${TF(s)}=${T(2.303 * s, 3)}` },
          { title: "Resultado", result: `${N(100 * 2.303 * s)} % (≈ ${N(sH, 2)} mol/L)` },
        ],
      };
    },
  },
  {
    id: "g-calib-unknown",
    topic: "e-calibracao",
    level: 2,
    difficulty: 2,
    title: "Concentração pela curva de calibração",
    make: (g) => {
      const m = g.num(0.05, 0.25, 3), b = g.num(0.002, 0.02, 2);
      const xs = [0, 1, 2, 4, 6, 8];
      const ys = xs.map((x) => +(m * x + b + g.num(-0.004, 0.004, 1)).toFixed(3));
      const reg = linreg(xs, ys);
      const yu = +(reg.predict(g.num(1.5, 7, 2))).toFixed(3);
      const xu = (yu - reg.intercept) / reg.slope;
      return {
        kind: "num",
        statement: `Curva analítica (c em mg/L; A): ${xs.map((x, i) => `(${x}; ${NF(ys[i], 3)})`).join(", ")}. Uma amostra apresentou A = ${NF(yu, 3)}. Calcule sua concentração (mg/L) por mínimos quadrados.`,
        answer: xu,
        unit: "mg/L",
        tol: 0.015,
        steps: [
          { title: "Ajuste linear", tex: r`A=${T(reg.slope, 4)}\,c+${T(reg.intercept, 3)}\quad(R^2=${T(reg.r2, 5)})` },
          { title: "Inverta a equação", tex: r`c=\frac{${TF(yu, 3)}-${T(reg.intercept, 3)}}{${T(reg.slope, 4)}}=${T(xu, 4)}`, result: `${N(xu)} mg/L` },
        ],
      };
    },
  },
  {
    id: "g-lod",
    topic: "e-calibracao",
    level: 2,
    difficulty: 1,
    title: "Limite de detecção",
    make: (g) => {
      const sb = g.num(0.0005, 0.004, 2), m = g.num(0.02, 0.3, 3);
      const lod = (3.3 * sb) / m;
      return {
        kind: "num",
        statement: `O desvio padrão de 10 brancos foi ${N(sb, 2)} (unidades de absorbância) e a sensibilidade da curva é ${N(m)} L/mg. Calcule o LOD (mg/L) pelo critério 3,3s/m.`,
        answer: lod,
        unit: "mg/L",
        steps: [{ title: "LOD", tex: r`\text{LOD}=\frac{3{,}3\times${T(sb, 2)}}{${T(m)}}=${T(lod)}`, result: `${N(lod)} mg/L` }],
      };
    },
  },
  {
    id: "g-std-addition",
    topic: "e-calibracao",
    level: 2,
    difficulty: 3,
    title: "Adição de padrão",
    make: (g) => {
      const cx = g.num(1, 8, 3), k = g.num(0.04, 0.12, 3);
      const added = [0, 2, 4, 6, 8];
      const ys = added.map((a) => +(k * (cx + a) + g.num(-0.003, 0.003, 1)).toFixed(3));
      const reg = linreg(added, ys);
      const C = reg.intercept / reg.slope;
      return {
        kind: "num",
        statement: `Adição de padrão (concentração adicionada na solução medida, µg/L; sinal): ${added.map((a, i) => `(${a}; ${NF(ys[i], 3)})`).join(", ")}. Qual a concentração do analito na solução medida?`,
        answer: C,
        unit: "µg/L",
        tol: 0.03,
        hint: "Extrapole a reta até sinal zero: c = b/m.",
        steps: [
          { title: "Reta", tex: r`y=${T(reg.slope, 4)}\,x+${T(reg.intercept, 4)}` },
          { title: "Intercepto em x", tex: r`c=\frac{b}{m}=\frac{${T(reg.intercept, 4)}}{${T(reg.slope, 4)}}=${T(C)}`, result: `${N(C)} µg/L` },
        ],
      };
    },
  },
  {
    id: "g-recovery",
    topic: "e-erros",
    level: 2,
    difficulty: 1,
    title: "Recuperação (exatidão)",
    make: (g) => {
      const c0 = g.num(2, 10, 3), add = g.num(2, 10, 3), rec = g.num(0.85, 1.08, 3);
      const cf = c0 + add * rec;
      return {
        kind: "num",
        statement: `Uma amostra com ${NF(c0, 2)} mg/L foi fortificada com ${NF(add, 2)} mg/L de padrão. A análise da amostra fortificada deu ${NF(cf, 2)} mg/L. Calcule a recuperação (%).`,
        answer: (100 * (cf - c0)) / add,
        unit: "%",
        tol: 0.01,
        steps: [{ title: "Recuperação", tex: r`R=\frac{${TF(cf)}-${TF(c0)}}{${TF(add)}}\times100=${TF((100 * (cf - c0)) / add, 1)}\%`, result: `${NF((100 * (cf - c0)) / add, 1)} %` }],
      };
    },
  },
];
