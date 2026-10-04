/**
 * Geradores paramétricos — Níveis 3 (Equilíbrio), 4 (Clássicos) e 5 (Instrumental).
 */
import type { Generator } from "./types";
import { N, T, TF, NF, mcq } from "./types";
import { log10 } from "../../engine/math";
import { getWeak, pHAt, pHStrongAcid, pHWeakAcid, pHWeakBase, type AcidBaseEntry } from "../../engine/acidbase";
import { activityCoefficient, alphaY4, argPoint, edtaPM, ionicStrength, KSP, logKfromE, METALS_EDTA, redoxE, solubility } from "../../engine/equilibria";
import { plates, resolution } from "../../engine/instrumental";
import { mm, prettyFormula } from "../../engine/stoich";

const r = String.raw;
const weakAcids = ["acetic", "formic", "benzoic", "lactic", "hf", "hocl", "hcn"].map(getWeak);
const weakBases = ["ammonia", "methylamine", "pyridine", "aniline"].map(getWeak);
const Ka = (e: AcidBaseEntry) => 10 ** -e.pKa[0];

export const GEN_ADV: Generator[] = [
  /* ============================ NÍVEL 3 ============================ */
  {
    id: "g-ionic-strength",
    topic: "q-equilibrio",
    level: 3,
    difficulty: 1,
    title: "Força iônica",
    make: (g) => {
      const salt = g.pick([
        { f: "NaCl", ions: [[1, 1], [1, -1]] },
        { f: "MgSO4", ions: [[1, 2], [1, -2]] },
        { f: "Na2SO4", ions: [[2, 1], [1, -2]] },
        { f: "CaCl2", ions: [[1, 2], [2, -1]] },
        { f: "LaCl3", ions: [[1, 3], [3, -1]] },
      ]);
      const c = g.pick([0.001, 0.005, 0.01, 0.02, 0.05, 0.1]);
      const mu = ionicStrength(salt.ions.map(([k, z]) => ({ c: k * c, z })));
      return {
        kind: "num",
        statement: `Calcule a força iônica de uma solução ${N(c)} mol/L de ${prettyFormula(salt.f)}.`,
        answer: mu,
        unit: "mol/L",
        steps: [
          { title: "Íons presentes", text: salt.ions.map(([k, z]) => `${N(k * c)} M de carga ${z > 0 ? "+" : ""}${z}`).join("; ") },
          { title: "μ = ½ Σ cᵢzᵢ²", tex: r`\mu=\tfrac12(${salt.ions.map(([k, z]) => `${T(k * c)}\cdot${z * z}`).join("+")})=${T(mu)}`, result: `μ = ${N(mu)} M` },
        ],
      };
    },
  },
  {
    id: "g-activity",
    topic: "q-equilibrio",
    level: 3,
    difficulty: 2,
    title: "Coeficiente de atividade",
    make: (g) => {
      const ion = g.pick([{ n: "Ca²⁺", z: 2, a: 600 }, { n: "SO₄²⁻", z: 2, a: 400 }, { n: "Na⁺", z: 1, a: 450 }, { n: "Cl⁻", z: 1, a: 300 }, { n: "Fe³⁺", z: 3, a: 900 }]);
      const mu = g.pick([0.001, 0.005, 0.01, 0.05, 0.1]);
      const gam = activityCoefficient(ion.z, mu, ion.a);
      return {
        kind: "num",
        statement: `Use a equação de Debye-Hückel estendida para calcular γ do ${ion.n} (α = ${ion.a} pm) em μ = ${N(mu)} M.`,
        answer: gam,
        tol: 0.02,
        steps: [
          { title: "Equação", tex: r`\log\gamma=\frac{-0{,}51\,z^2\sqrt\mu}{1+\alpha\sqrt\mu/305}=\frac{-0{,}51(${ion.z * ion.z})\sqrt{${T(mu)}}}{1+${ion.a}\sqrt{${T(mu)}}/305}` },
          { title: "Resultado", tex: r`\log\gamma=${T(log10(gam), 3)}\Rightarrow\gamma=${T(gam, 3)}`, result: `γ = ${NF(gam, 3)}` },
        ],
      };
    },
  },
  {
    id: "g-ph-strong",
    topic: "q-acidobase",
    level: 3,
    difficulty: 1,
    title: "pH de ácido/base forte",
    make: (g) => {
      const acid = g.next() < 0.5;
      const c = g.num(1.1, 9.9, 2) * 10 ** -g.int(1, 4);
      const pH = acid ? -log10(c) : 14 + log10(c);
      return {
        kind: "num",
        statement: `Calcule o pH de uma solução ${N(c, 2)} mol/L de ${acid ? "HNO₃" : "KOH"} a 25 °C.`,
        answer: pH,
        absTol: 0.02,
        steps: acid
          ? [{ title: "Ionização completa", tex: r`\text{pH}=-\log ${T(c, 2)}=${TF(pH)}`, result: `pH = ${NF(pH)}` }]
          : [
              { title: "pOH", tex: r`\text{pOH}=-\log ${T(c, 2)}=${TF(14 - pH)}` },
              { title: "pH", tex: r`\text{pH}=14{,}00-${TF(14 - pH)}=${TF(pH)}`, result: `pH = ${NF(pH)}` },
            ],
      };
    },
  },
  {
    id: "g-ph-dilute",
    topic: "q-acidobase",
    level: 3,
    difficulty: 3,
    title: "Ácido forte muito diluído",
    make: (g) => {
      const c = g.num(1.1, 9.9, 2) * 10 ** -g.pick([7, 8]);
      const pH = pHStrongAcid(c);
      return {
        kind: "num",
        statement: `Calcule o pH de HCl ${N(c, 2)} mol/L, considerando a autoionização da água.`,
        answer: pH,
        absTol: 0.02,
        hint: "Balanço de carga: [H⁺] = [Cl⁻] + [OH⁻] = c + Kw/[H⁺].",
        steps: [
          { title: "Balanço de carga", tex: r`[\text{H}^+]^2-c[\text{H}^+]-K_w=0` },
          { title: "Raiz positiva", tex: r`[\text{H}^+]=\frac{c+\sqrt{c^2+4K_w}}{2}=${T(10 ** -pH, 3)}` },
          { title: "pH", result: `pH = ${NF(pH)}` },
        ],
      };
    },
  },
  {
    id: "g-ph-weak-acid",
    topic: "q-acidobase",
    level: 3,
    difficulty: 2,
    title: "pH de ácido fraco",
    make: (g) => {
      const e = g.pick(weakAcids);
      const c = g.pick([0.2, 0.1, 0.05, 0.02, 0.01]);
      const res = pHWeakAcid(c, Ka(e));
      return {
        kind: "num",
        statement: `Calcule o pH de ${e.name} (${e.formula}) ${N(c)} mol/L. Dado: pKa = ${NF(e.pKa[0])}.`,
        answer: res.pH,
        absTol: 0.03,
        steps: [
          { title: "Equilíbrio", tex: r`K_a=\frac{x^2}{c-x},\quad K_a=10^{-${TF(e.pKa[0])}}=${T(Ka(e))}` },
          { title: "Aproximação x ≪ c", tex: r`x\approx\sqrt{K_ac}=${T(10 ** -res.approx)}\Rightarrow\text{pH}\approx${TF(res.approx)}` },
          { title: "Validação", text: `Ionização = ${N(res.ionization, 2)} % ${res.ionization < 5 ? "(< 5 %, aproximação válida)" : "(> 5 %: use a equação quadrática)"}` },
          { title: "Solução exata (quadrática)", tex: r`x=\frac{-K_a+\sqrt{K_a^2+4K_ac}}{2}=${T(res.x)}`, result: `pH = ${NF(res.pH)}` },
        ],
      };
    },
  },
  {
    id: "g-ph-weak-base",
    topic: "q-acidobase",
    level: 3,
    difficulty: 2,
    title: "pH de base fraca",
    make: (g) => {
      const e = g.pick(weakBases);
      const c = g.pick([0.2, 0.1, 0.05, 0.01]);
      const Kb = 1e-14 / Ka(e);
      const res = pHWeakBase(c, Kb);
      return {
        kind: "num",
        statement: `Calcule o pH de ${e.name} ${N(c)} mol/L. Dado: pKa do ácido conjugado = ${NF(e.pKa[0])}.`,
        answer: res.pH,
        absTol: 0.03,
        steps: [
          { title: "Kb do par conjugado", tex: r`K_b=\frac{K_w}{K_a}=\frac{10^{-14}}{10^{-${TF(e.pKa[0])}}}=${T(Kb)}` },
          { title: "[OH⁻]", tex: r`x=\frac{-K_b+\sqrt{K_b^2+4K_bc}}{2}=${T(res.x)}` },
          { title: "pH", tex: r`\text{pOH}=${TF(14 - res.pH)}\Rightarrow\text{pH}=${TF(res.pH)}`, result: `pH = ${NF(res.pH)}` },
        ],
      };
    },
  },
  {
    id: "g-buffer-hh",
    topic: "q-tampao",
    level: 3,
    difficulty: 1,
    title: "pH de tampão",
    make: (g) => {
      const e = g.pick([getWeak("acetic"), getWeak("formic"), getWeak("ammonia"), getWeak("tris")]);
      const ca = g.num(0.05, 0.3, 2), cb = g.num(0.05, 0.3, 2);
      const pH = e.pKa[0] + log10(cb / ca);
      const isBase = e.kind === "base";
      return {
        kind: "num",
        statement: isBase
          ? `Um tampão contém ${e.name} ${N(cb, 2)} mol/L e seu cloridrato ${N(ca, 2)} mol/L. Calcule o pH (pKa = ${NF(e.pKa[0])}).`
          : `Um tampão contém ${e.name} ${N(ca, 2)} mol/L e seu sal de sódio ${N(cb, 2)} mol/L. Calcule o pH (pKa = ${NF(e.pKa[0])}).`,
        answer: pH,
        absTol: 0.02,
        steps: [{ title: "Henderson-Hasselbalch", tex: r`\text{pH}=${TF(e.pKa[0])}+\log\frac{${T(cb, 2)}}{${T(ca, 2)}}=${TF(pH)}`, result: `pH = ${NF(pH)}` }],
      };
    },
  },
  {
    id: "g-buffer-add",
    topic: "q-tampao",
    level: 3,
    difficulty: 3,
    title: "Tampão após adição de ácido forte",
    make: (g) => {
      const V = 100, ca = g.num(0.08, 0.2, 2), cb = g.num(0.08, 0.2, 2);
      const nH = g.num(0.5, 4, 2); // mmol
      const nA = cb * V - nH, nHA = ca * V + nH;
      const pH0 = 4.756 + log10(cb / ca);
      const pH = 4.756 + log10(nA / nHA);
      return {
        kind: "num",
        statement: `A ${V},0 mL de tampão ácido acético ${N(ca, 2)} M / acetato ${N(cb, 2)} M (pKa 4,76) adicionam-se ${NF(nH, 2)} mmol de HCl. Qual o novo pH?`,
        answer: pH,
        absTol: 0.02,
        steps: [
          { title: "pH inicial", tex: r`\text{pH}_0=4{,}76+\log\frac{${T(cb, 2)}}{${T(ca, 2)}}=${TF(pH0)}` },
          { title: "H⁺ converte A⁻ em HA", tex: r`n_{\text{A}^-}=${T(cb * V, 3)}-${T(nH, 2)}=${T(nA, 3)}\ \text{mmol};\quad n_\text{HA}=${T(nHA, 3)}\ \text{mmol}` },
          { title: "Novo pH (o volume se cancela)", tex: r`\text{pH}=4{,}76+\log\frac{${T(nA, 3)}}{${T(nHA, 3)}}=${TF(pH)}`, result: `pH = ${NF(pH)} (Δ = ${NF(pH - pH0)})` },
        ],
      };
    },
  },
  {
    id: "g-buffer-design",
    topic: "q-tampao",
    level: 3,
    difficulty: 2,
    title: "Razão base/ácido para pH alvo",
    make: (g) => {
      const e = g.pick([getWeak("acetic"), getWeak("phosphoric"), getWeak("ammonia")]);
      const pKa = e.id === "phosphoric" ? e.pKa[1] : e.pKa[0];
      const target = +(pKa + g.num(-0.8, 0.8, 2)).toFixed(2);
      const ratio = 10 ** (target - pKa);
      const pair = e.id === "phosphoric" ? "HPO₄²⁻/H₂PO₄⁻" : e.id === "ammonia" ? "NH₃/NH₄⁺" : "CH₃COO⁻/CH₃COOH";
      return {
        kind: "num",
        statement: `Qual razão ${pair} é necessária para preparar um tampão de pH ${NF(target)}? (pKa = ${NF(pKa)})`,
        answer: ratio,
        tol: 0.03,
        steps: [
          { title: "Isole a razão", tex: r`\log\frac{[\text{base}]}{[\text{ácido}]}=${TF(target)}-${TF(pKa)}=${TF(target - pKa)}` },
          { title: "Antilog", tex: r`\frac{[\text{base}]}{[\text{ácido}]}=10^{${TF(target - pKa)}}=${T(ratio)}`, result: N(ratio) },
        ],
      };
    },
  },
  {
    id: "g-amphiprotic",
    topic: "q-poliprotico",
    level: 3,
    difficulty: 2,
    title: "pH de espécie anfiprótica",
    make: (g) => {
      const sp = g.pick([
        { s: "NaHCO₃", id: "carbonic", i: 0 },
        { s: "NaH₂PO₄", id: "phosphoric", i: 0 },
        { s: "Na₂HPO₄", id: "phosphoric", i: 1 },
        { s: "KHC₈H₄O₄ (biftalato)", id: "phosphoric_x", i: 0 },
      ]);
      const e = sp.id === "phosphoric_x" ? getWeak("phthalic") : getWeak(sp.id);
      const k1 = e.pKa[sp.i], k2 = e.pKa[sp.i + 1];
      const pH = (k1 + k2) / 2;
      return {
        kind: "num",
        statement: `Estime o pH de uma solução 0,10 mol/L de ${sp.s}. Dados: pKa vizinhos = ${NF(k1)} e ${NF(k2)}.`,
        answer: pH,
        absTol: 0.06,
        steps: [
          { title: "Espécie anfiprótica", text: "Pode doar e receber próton; para c ≫ K₁, [H⁺] ≈ √(K₁K₂)." },
          { title: "pH", tex: r`\text{pH}\approx\frac{${TF(k1)}+${TF(k2)}}{2}=${TF(pH)}`, result: `pH ≈ ${NF(pH)}` },
        ],
      };
    },
  },
  {
    id: "g-alpha-fraction",
    topic: "q-poliprotico",
    level: 3,
    difficulty: 3,
    title: "Fração α de espécie",
    make: (g) => {
      const e = getWeak(g.pick(["carbonic", "oxalic", "phthalic", "ascorbic"]));
      const pH = g.num(2, 11, 3);
      const H = 10 ** -pH;
      const K1 = 10 ** -e.pKa[0], K2 = 10 ** -e.pKa[1];
      const D = H * H + K1 * H + K1 * K2;
      const a1 = (K1 * H) / D;
      return {
        kind: "num",
        statement: `Para ${e.name} (pKa₁ = ${NF(e.pKa[0])}, pKa₂ = ${NF(e.pKa[1])}), calcule a fração α da forma monoprotonada (HA⁻) em pH ${NF(pH)}.`,
        answer: a1,
        tol: 0.03,
        steps: [
          { title: "Denominador", tex: r`D=[\text{H}^+]^2+K_1[\text{H}^+]+K_1K_2=${T(D, 4)}` },
          { title: "α(HA⁻)", tex: r`\alpha=\frac{K_1[\text{H}^+]}{D}=${T(a1, 3)}`, result: `α = ${N(a1)}` },
        ],
      };
    },
  },
  {
    id: "g-ksp-s",
    topic: "q-solubilidade",
    level: 3,
    difficulty: 1,
    title: "Solubilidade a partir do Kps",
    make: (g) => {
      const salt = g.pick(KSP.filter((k) => k.cation[0] + k.anion[0] <= 4));
      const [a] = salt.cation, [b] = salt.anion;
      const s = solubility(salt.Ksp, a, b);
      return {
        kind: "num",
        statement: `Calcule a solubilidade molar de ${salt.formula} em água pura (Kps = ${N(salt.Ksp, 2)}).`,
        answer: s,
        unit: "mol/L",
        tol: 0.02,
        steps: [
          { title: "Expressão", tex: r`K_{ps}=(${a}s)^{${a}}(${b}s)^{${b}}=${a ** a * b ** b}s^{${a + b}}` },
          { title: "Isole s", tex: r`s=\sqrt[${a + b}]{\frac{${T(salt.Ksp, 2)}}{${a ** a * b ** b}}}=${T(s)}`, result: `${N(s)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-ksp-common",
    topic: "q-solubilidade",
    level: 3,
    difficulty: 2,
    title: "Efeito do íon comum",
    make: (g) => {
      const salt = g.pick(KSP.filter((k) => ["AgCl", "BaSO₄", "CaF₂", "PbI₂", "Ag₂CrO₄"].includes(k.formula)));
      const [a] = salt.cation, [b] = salt.anion;
      const cX = g.pick([0.001, 0.01, 0.05, 0.1]);
      const s = solubility(salt.Ksp, a, b, 0, cX);
      return {
        kind: "num",
        statement: `Qual a solubilidade molar de ${salt.formula} (Kps = ${N(salt.Ksp, 2)}) numa solução que já contém ${N(cX)} mol/L do ânion comum?`,
        answer: s,
        unit: "mol/L",
        tol: 0.03,
        steps: [
          { title: "Kps com íon comum", tex: r`K_{ps}=(${a}s)^{${a}}(${b}s+${T(cX)})^{${b}}` },
          { title: "Aproximação bs ≪ c", tex: r`s\approx\left(\frac{K_{ps}}{${a ** a}\,(${T(cX)})^{${b}}}\right)^{1/${a}}`, result: `s = ${N(s)} mol/L` },
        ],
      };
    },
  },

  /* ============================ NÍVEL 4 ============================ */
  {
    id: "g-titr-weak-before",
    topic: "c-neutralizacao",
    level: 4,
    difficulty: 2,
    title: "pH antes do PE (ácido fraco × NaOH)",
    make: (g) => {
      const e = g.pick(weakAcids.slice(0, 4));
      const C = 0.1, Va = 50, Cb = 0.1;
      const Vb = g.pick([5, 10, 15, 20, 30, 35, 40]);
      const setup = { analyte: { type: "weak" as const, entry: e, C }, Va, titrant: { type: "strong-base" as const, C: Cb }, Vmax: 100 };
      const pH = pHAt(setup, Vb);
      const hh = e.pKa[0] + log10(Vb / (50 - Vb));
      return {
        kind: "num",
        statement: `50,00 mL de ${e.name} 0,1000 M (pKa ${NF(e.pKa[0])}) são titulados com NaOH 0,1000 M. Calcule o pH após adição de ${Vb},00 mL.`,
        answer: pH,
        absTol: 0.04,
        steps: [
          { title: "Mols", tex: r`n_\text{HA}=5{,}000\ \text{mmol};\ n_{\text{OH}}=${T(Vb * 0.1, 3)}\ \text{mmol}` },
          { title: "Região tampão", tex: r`\text{pH}=${TF(e.pKa[0])}+\log\frac{${T(Vb * 0.1, 3)}}{${T(5 - Vb * 0.1, 3)}}=${TF(hh)}` },
          { title: "Valor exato (balanço de carga)", result: `pH = ${NF(pH)}` },
        ],
      };
    },
  },
  {
    id: "g-titr-weak-eq",
    topic: "c-neutralizacao",
    level: 4,
    difficulty: 3,
    title: "pH no ponto de equivalência",
    make: (g) => {
      const e = g.pick(weakAcids.slice(0, 5));
      const C = g.pick([0.05, 0.1, 0.2]), Va = g.pick([25, 50]), Cb = g.pick([0.1, 0.2]);
      const Veq = (C * Va) / Cb;
      const setup = { analyte: { type: "weak" as const, entry: e, C }, Va, titrant: { type: "strong-base" as const, C: Cb }, Vmax: 2 * Veq };
      const pH = pHAt(setup, Veq);
      const cA = (C * Va) / (Va + Veq);
      const Kb = 1e-14 / Ka(e);
      return {
        kind: "num",
        statement: `${Va},00 mL de ${e.name} ${N(C)} M (pKa ${NF(e.pKa[0])}) são titulados com NaOH ${N(Cb)} M. Qual o pH no ponto de equivalência?`,
        answer: pH,
        absTol: 0.04,
        steps: [
          { title: "Volume no PE", tex: r`V_\text{PE}=\frac{${T(C)}\times${Va}}{${T(Cb)}}=${T(Veq)}\ \text{mL}` },
          { title: "Concentração de A⁻", tex: r`c_{\text{A}^-}=\frac{${T(C * Va)}\ \text{mmol}}{${T(Va + Veq)}\ \text{mL}}=${T(cA)}\ \text{M}` },
          { title: "Hidrólise do A⁻", tex: r`[\text{OH}^-]=\sqrt{K_bc}=\sqrt{${T(Kb)}\times${T(cA)}}=${T(Math.sqrt(Kb * cA))}` },
          { title: "pH", result: `pH = ${NF(pH)}` },
        ],
      };
    },
  },
  {
    id: "g-titr-strong-after",
    topic: "c-neutralizacao",
    level: 4,
    difficulty: 1,
    title: "pH após o PE (forte × forte)",
    make: (g) => {
      const C = g.pick([0.1, 0.05]), Va = 50, Cb = 0.1;
      const Veq = (C * Va) / Cb;
      const Vb = +(Veq + g.pick([0.1, 0.5, 1, 2, 5, 10])).toFixed(2);
      const exc = (Cb * Vb - C * Va) / (Va + Vb);
      const pH = 14 + log10(exc);
      return {
        kind: "num",
        statement: `50,00 mL de HCl ${N(C)} M são titulados com NaOH 0,1000 M. Calcule o pH após ${NF(Vb, 2)} mL de titulante.`,
        answer: pH,
        absTol: 0.03,
        steps: [
          { title: "Excesso de OH⁻", tex: r`n=${TF(Cb * Vb, 3)}-${TF(C * Va, 3)}=${T(Cb * Vb - C * Va)}\ \text{mmol}` },
          { title: "Concentração", tex: r`[\text{OH}^-]=\frac{${T(Cb * Vb - C * Va)}}{${T(Va + Vb, 4)}}=${T(exc)}` },
          { title: "pH", result: `pH = ${NF(pH)}` },
        ],
      };
    },
  },
  {
    id: "g-indicator",
    topic: "c-neutralizacao",
    level: 4,
    difficulty: 2,
    title: "Escolha do indicador",
    make: (g) => {
      const kind = g.pick(["weakacid", "weakbase", "strong"] as const);
      const map = {
        weakacid: { s: "ácido acético 0,1 M com NaOH 0,1 M (pH no PE ≈ 8,7)", c: "Fenolftaleína (8,2–10,0)" },
        weakbase: { s: "amônia 0,1 M com HCl 0,1 M (pH no PE ≈ 5,3)", c: "Vermelho de metila (4,4–6,2)" },
        strong: { s: "HCl 0,1 M com NaOH 0,1 M (pH no PE = 7,0)", c: "Azul de bromotimol (6,0–7,6)" },
      } as const;
      const all = ["Fenolftaleína (8,2–10,0)", "Vermelho de metila (4,4–6,2)", "Azul de bromotimol (6,0–7,6)", "Alaranjado de metila (3,1–4,4)", "Timolftaleína (9,3–10,5)"];
      const m = map[kind];
      const wrong = all.filter((x) => x !== m.c);
      const opts = mcq(g, m.c, g.shuffle(wrong).slice(0, 3));
      return {
        kind: "mcq",
        statement: `Qual indicador é o MAIS adequado para a titulação de ${m.s}?`,
        ...opts,
        steps: [
          { title: "Critério", text: "A faixa de viragem deve estar dentro do salto vertical e o mais próxima possível do pH no PE." },
          { title: "Escolha", result: m.c },
        ],
      };
    },
  },
  {
    id: "g-mohr",
    topic: "c-precipitacao",
    level: 4,
    difficulty: 2,
    title: "Cloreto pelo método de Mohr",
    make: (g) => {
      const ms = g.num(0.15, 0.35, 4), frac = g.num(0.4, 0.6, 3), c = g.num(0.095, 0.105, 4);
      const nCl = (ms * frac) / 35.453;
      const V = +((nCl / c) * 1000).toFixed(2);
      const p = ((c * V) / 1000 * 35.453 * 100) / ms;
      return {
        kind: "num",
        statement: `${NF(ms, 4)} g de amostra foram titulados com AgNO₃ ${NF(c, 4)} M pelo método de Mohr, gastando ${NF(V, 2)} mL. Calcule o teor de cloreto (% m/m).`,
        answer: p,
        unit: "%",
        tol: 0.004,
        steps: [
          { title: "Mols de Ag⁺ = mols de Cl⁻", tex: r`n=${TF(c, 4)}\times${T(V / 1000, 4)}=${T((c * V) / 1000, 4)}` },
          { title: "Massa de Cl", tex: r`m=${T((c * V) / 1000, 4)}\times35{,}453=${TF((c * V) / 1000 * 35.453, 4)}\ \text{g}` },
          { title: "Teor", result: `${NF(p, 2)} %` },
        ],
      };
    },
  },
  {
    id: "g-pag-eq",
    topic: "c-precipitacao",
    level: 4,
    difficulty: 2,
    title: "pAg ao longo da titulação",
    make: (g) => {
      const salt = g.pick(KSP.filter((k) => ["AgCl", "AgBr", "AgI"].includes(k.formula)));
      const CX = 0.05, VX = 50, CAg = 0.1;
      const V = g.pick([10, 20, 25, 30, 35]);
      const p = argPoint({ CX, VX, CAg, Ksp: salt.Ksp, Vmax: 50 }, V);
      const region = V < 25 ? "antes do PE" : V === 25 ? "no PE" : "após o PE";
      return {
        kind: "num",
        statement: `50,00 mL de haleto 0,0500 M são titulados com AgNO₃ 0,1000 M, formando ${salt.formula} (Kps = ${N(salt.Ksp, 2)}). Calcule o pAg após ${V},00 mL.`,
        answer: p.pAg,
        absTol: 0.04,
        steps: [
          { title: "Região", text: `V_PE = 25,00 mL → ${region}.` },
          V < 25
            ? { title: "Excesso de haleto", tex: r`[\text{X}^-]=\frac{2{,}500-${T(V * 0.1, 3)}}{${50 + V}}=${T(10 ** -p.pX)};\ \text{pAg}=\text{p}K_{ps}-\text{pX}` }
            : V === 25
              ? { title: "No PE", tex: r`[\text{Ag}^+]=\sqrt{K_{ps}}` }
              : { title: "Excesso de Ag⁺", tex: r`[\text{Ag}^+]=\frac{${T(V * 0.1, 3)}-2{,}500}{${50 + V}}` },
          { title: "Resultado", result: `pAg = ${NF(p.pAg)}` },
        ],
      };
    },
  },
  {
    id: "g-volhard",
    topic: "c-precipitacao",
    level: 4,
    difficulty: 3,
    title: "Método de Volhard (retrotitulação)",
    make: (g) => {
      const ms = g.num(0.2, 0.4, 4), frac = g.num(0.3, 0.55, 3);
      const VAg = 50, cAg = 0.1, cSCN = g.num(0.095, 0.105, 4);
      const nCl = (ms * frac) / 35.453;
      const VS = +((((VAg * cAg) / 1000 - nCl) / cSCN) * 1000).toFixed(2);
      const p = ((((VAg * cAg) / 1000 - (cSCN * VS) / 1000) * 35.453) * 100) / ms;
      return {
        kind: "num",
        statement: `A ${NF(ms, 4)} g de amostra adicionaram-se 50,00 mL de AgNO₃ 0,1000 M. Após remover o AgCl, o excesso de Ag⁺ consumiu ${NF(VS, 2)} mL de KSCN ${NF(cSCN, 4)} M (Fe³⁺ como indicador). Calcule % Cl.`,
        answer: p,
        unit: "%",
        tol: 0.006,
        steps: [
          { title: "Ag⁺ total", tex: r`5{,}000\times10^{-3}\ \text{mol}` },
          { title: "Ag⁺ em excesso", tex: r`${TF(cSCN, 4)}\times${T(VS / 1000, 4)}=${T((cSCN * VS) / 1000, 4)}\ \text{mol}` },
          { title: "Ag⁺ que reagiu com Cl⁻", tex: r`${T(0.005 - (cSCN * VS) / 1000, 4)}\ \text{mol}` },
          { title: "Teor", result: `${NF(p, 2)} %` },
        ],
      };
    },
  },
  {
    id: "g-edta-alpha",
    topic: "c-complexometria",
    level: 4,
    difficulty: 2,
    title: "Constante condicional do EDTA",
    make: (g) => {
      const metal = g.pick(METALS_EDTA.filter((m) => ["Ca²⁺", "Mg²⁺", "Zn²⁺", "Cu²⁺", "Ni²⁺", "Pb²⁺"].includes(m.ion)));
      const pH = g.pick([6, 7, 8, 9, 10, 11]);
      const a = alphaY4(pH);
      const Kp = 10 ** metal.logKf * a;
      return {
        kind: "num",
        statement: `Calcule log K'f para o complexo ${metal.ion}–EDTA em pH ${pH} (log Kf = ${NF(metal.logKf)}; α(Y⁴⁻) = ${N(a, 2)}).`,
        answer: log10(Kp),
        absTol: 0.03,
        steps: [
          { title: "Constante condicional", tex: r`K_f'=\alpha_{\text{Y}^{4-}}K_f` },
          { title: "Em log", tex: r`\log K_f'=${TF(metal.logKf)}+\log(${T(a, 2)})=${TF(log10(Kp))}`, result: `log K'f = ${NF(log10(Kp))}` },
        ],
      };
    },
  },
  {
    id: "g-edta-pm-eq",
    topic: "c-complexometria",
    level: 4,
    difficulty: 3,
    title: "pM no PE da titulação com EDTA",
    make: (g) => {
      const metal = g.pick(METALS_EDTA.filter((m) => ["Ca²⁺", "Mg²⁺", "Zn²⁺"].includes(m.ion)));
      const CM = g.pick([0.02, 0.04, 0.05]), VM = 50, CY = g.pick([0.04, 0.05, 0.08, 0.1]);
      const Veq = (CM * VM) / CY;
      const s = { CM, VM, CY, logKf: metal.logKf, pH: 10, Vmax: 2 * Veq };
      const pM = edtaPM(s, Veq);
      const Kp = 10 ** metal.logKf * alphaY4(10);
      const cMY = (CM * VM) / (VM + Veq);
      return {
        kind: "num",
        statement: `50,00 mL de ${metal.ion} ${N(CM)} M (tampão pH 10, α(Y⁴⁻) = 0,30) são titulados com EDTA ${N(CY)} M. Calcule p${metal.ion.replace(/[²⁺]/g, "")} no PE (log Kf = ${NF(metal.logKf)}).`,
        answer: pM,
        absTol: 0.04,
        steps: [
          { title: "V_PE e [MY]", tex: r`V_\text{PE}=${T(Veq)}\ \text{mL};\ c_\text{MY}=\frac{${T(CM * VM)}}{${T(VM + Veq)}}=${T(cMY)}\ \text{M}` },
          { title: "K'f", tex: r`K_f'=0{,}30\times10^{${TF(metal.logKf)}}=${T(Kp)}` },
          { title: "Dissociação do complexo", tex: r`\frac{c_\text{MY}}{x^2}=K_f'\Rightarrow x=\sqrt{\frac{${T(cMY)}}{${T(Kp)}}}=${T(10 ** -pM)}`, result: `pM = ${NF(pM)}` },
        ],
      };
    },
  },
  {
    id: "g-hardness",
    topic: "c-complexometria",
    level: 4,
    difficulty: 1,
    title: "Dureza da água",
    make: (g) => {
      const Va = g.pick([50, 100]), cY = g.num(0.009, 0.011, 4), V = g.num(5, 25, 3);
      const d = ((cY * V) / 1000) * 100.09 * 1000 / (Va / 1000);
      return {
        kind: "num",
        statement: `${Va},00 mL de água foram titulados com EDTA ${NF(cY, 4)} M em pH 10 (Erio T), gastando ${NF(V, 2)} mL. Expresse a dureza total em mg/L de CaCO₃.`,
        answer: d,
        unit: "mg/L CaCO₃",
        tol: 0.01,
        steps: [
          { title: "Mols de (Ca²⁺ + Mg²⁺)", tex: r`n=${TF(cY, 4)}\times${T(V / 1000, 4)}=${T((cY * V) / 1000, 4)}\ \text{mol}` },
          { title: "Como CaCO₃", tex: r`m=${T((cY * V) / 1000, 4)}\times100{,}09=${T((cY * V) / 1000 * 100.09 * 1000, 4)}\ \text{mg}` },
          { title: "Por litro", result: `${N(d, 4)} mg/L de CaCO₃` },
        ],
      };
    },
  },
  {
    id: "g-redox-eq",
    topic: "c-redox",
    level: 4,
    difficulty: 2,
    title: "Potencial no ponto de equivalência",
    make: (g) => {
      const p = g.pick([
        { l: "Fe²⁺ com Ce⁴⁺", E1: 0.68, n1: 1, E2: 1.44, n2: 1 },
        { l: "Fe²⁺ com MnO₄⁻ (pH 0)", E1: 0.771, n1: 1, E2: 1.507, n2: 5 },
        { l: "Sn²⁺ com Ce⁴⁺", E1: 0.139, n1: 2, E2: 1.44, n2: 1 },
        { l: "U⁴⁺ com Ce⁴⁺", E1: 0.334, n1: 2, E2: 1.44, n2: 1 },
      ]);
      const E = (p.n1 * p.E1 + p.n2 * p.E2) / (p.n1 + p.n2);
      return {
        kind: "num",
        statement: `Calcule o potencial no ponto de equivalência da titulação de ${p.l}. Dados: E°(analito) = ${NF(p.E1, 3)} V (n = ${p.n1}); E°(titulante) = ${NF(p.E2, 3)} V (n = ${p.n2}).`,
        answer: E,
        unit: "V",
        absTol: 0.006,
        steps: [{ title: "Média ponderada pelos elétrons", tex: r`E_\text{PE}=\frac{${p.n1}(${TF(p.E1, 3)})+${p.n2}(${TF(p.E2, 3)})}{${p.n1 + p.n2}}=${TF(E, 3)}\ \text{V}`, result: `${NF(E, 3)} V` }],
      };
    },
  },
  {
    id: "g-redox-before",
    topic: "c-redox",
    level: 4,
    difficulty: 3,
    title: "Potencial antes do PE",
    make: (g) => {
      const V = g.pick([5, 10, 15, 20, 22.5]);
      const s = { label: "", E1: 0.68, n1: 1, E2: 1.44, n2: 1, C1: 0.05, V1: 50, C2: 0.1, Vmax: 50 };
      const E = redoxE(s, V);
      const frac = V / 25;
      return {
        kind: "num",
        statement: `50,00 mL de Fe²⁺ 0,0500 M (H₂SO₄ 1 M) são titulados com Ce⁴⁺ 0,1000 M. Calcule E (vs EPH) após ${NF(V, 1)} mL. E°'(Fe³⁺/Fe²⁺) = 0,68 V.`,
        answer: E,
        unit: "V",
        absTol: 0.005,
        steps: [
          { title: "Fração titulada", tex: r`f=\frac{${TF(V, 1)}}{25{,}00}=${TF(frac, 3)}` },
          { title: "Nernst do par Fe", tex: r`E=0{,}68-0{,}05916\log\frac{[\text{Fe}^{2+}]}{[\text{Fe}^{3+}]}=0{,}68-0{,}05916\log\frac{${TF(1 - frac, 3)}}{${TF(frac, 3)}}` },
          { title: "Resultado", result: `E = ${NF(E, 3)} V` },
        ],
      };
    },
  },
  {
    id: "g-kmno4-std",
    topic: "c-redox",
    level: 4,
    difficulty: 2,
    title: "Padronização de KMnO₄ com oxalato",
    make: (g) => {
      const m = g.num(0.18, 0.3, 4), c = g.num(0.019, 0.021, 4);
      const nOx = m / 134.0;
      const V = +(((nOx * 2) / 5 / c) * 1000).toFixed(2);
      const cc = (nOx * 2) / 5 / (V / 1000);
      return {
        kind: "num",
        statement: `${NF(m, 4)} g de Na₂C₂O₄ (134,00 g/mol) consumiram ${NF(V, 2)} mL de KMnO₄ em meio ácido a quente. Qual a concentração do KMnO₄ (mol/L)?`,
        answer: cc,
        unit: "mol/L",
        tol: 0.005,
        hint: "2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O",
        steps: [
          { title: "Mols de oxalato", tex: r`n=\frac{${TF(m, 4)}}{134{,}00}=${T(nOx, 4)}\ \text{mol}` },
          { title: "Razão 2:5", tex: r`n_{\text{MnO}_4^-}=\frac25\times${T(nOx, 4)}=${T((nOx * 2) / 5, 4)}` },
          { title: "Concentração", result: `${N(cc, 4)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-dichromate-fe",
    topic: "c-redox",
    level: 4,
    difficulty: 3,
    title: "Ferro em minério por dicromatometria",
    make: (g) => {
      const ms = g.num(0.4, 0.7, 4), frac = g.num(0.3, 0.6, 3), c = g.num(0.0165, 0.0170, 4);
      const nFe = (ms * frac) / 55.845;
      const V = +((nFe / 6 / c) * 1000).toFixed(2);
      const p = (((c * V) / 1000) * 6 * 55.845 * 100) / ms;
      return {
        kind: "num",
        statement: `${NF(ms, 4)} g de minério foram dissolvidos e o ferro reduzido a Fe²⁺. A titulação consumiu ${NF(V, 2)} mL de K₂Cr₂O₇ ${NF(c, 4)} M. Calcule % Fe.`,
        answer: p,
        unit: "%",
        tol: 0.005,
        hint: "Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O",
        steps: [
          { title: "Mols de dicromato", tex: r`${TF(c, 4)}\times${T(V / 1000, 4)}=${T((c * V) / 1000, 4)}\ \text{mol}` },
          { title: "Fe²⁺ = 6 × dicromato", tex: r`n_\text{Fe}=${T((6 * c * V) / 1000, 4)}\ \text{mol}` },
          { title: "Teor", result: `${NF(p, 2)} % Fe` },
        ],
      };
    },
  },
  {
    id: "g-grav-factor",
    topic: "c-gravimetria",
    level: 4,
    difficulty: 1,
    title: "Fator gravimétrico",
    make: (g) => {
      const c = g.pick([
        { a: "Fe", p: "Fe2O3", k: 2 },
        { a: "Fe3O4", p: "Fe2O3", k: 2 / 3 },
        { a: "Cl", p: "AgCl", k: 1 },
        { a: "S", p: "BaSO4", k: 1 },
        { a: "SO3", p: "BaSO4", k: 1 },
        { a: "Mg", p: "Mg2P2O7", k: 2 },
        { a: "P2O5", p: "Mg2P2O7", k: 1 },
        { a: "Ni", p: "Ni(C4H7N2O2)2", k: 1 },
        { a: "Al", p: "Al2O3", k: 2 },
      ]);
      const fg = (c.k * mm(c.a)) / mm(c.p);
      return {
        kind: "num",
        statement: `Calcule o fator gravimétrico para determinar ${prettyFormula(c.a)} pesando ${prettyFormula(c.p)}.`,
        answer: fg,
        tol: 0.003,
        steps: [
          { title: "Iguale o elemento comum", text: `Razão estequiométrica analito : precipitado = ${c.k === 2 / 3 ? "2 : 3" : `${c.k} : 1`}` },
          { title: "FG", tex: r`\text{FG}=\frac{${c.k === 2 / 3 ? "2" : c.k}\times${TF(mm(c.a))}}{${c.k === 2 / 3 ? "3\\times" : ""}${TF(mm(c.p))}}=${T(fg, 4)}`, result: `FG = ${NF(fg, 4)}` },
        ],
      };
    },
  },
  {
    id: "g-grav-pct",
    topic: "c-gravimetria",
    level: 4,
    difficulty: 2,
    title: "Teor por gravimetria",
    make: (g) => {
      const c = g.pick([
        { a: "Fe", p: "Fe2O3", k: 2, name: "ferro" },
        { a: "S", p: "BaSO4", k: 1, name: "enxofre" },
        { a: "Ni", p: "Ni(C4H7N2O2)2", k: 1, name: "níquel" },
        { a: "Mg", p: "Mg2P2O7", k: 2, name: "magnésio" },
      ]);
      const fg = (c.k * mm(c.a)) / mm(c.p);
      const ms = g.num(0.4, 1.2, 4), mp = g.num(0.15, 0.6, 4);
      const pct = ((mp * fg) / ms) * 100;
      return {
        kind: "num",
        statement: `${NF(ms, 4)} g de amostra forneceram ${NF(mp, 4)} g de ${prettyFormula(c.p)} calcinado. Calcule a porcentagem de ${c.name}.`,
        answer: pct,
        unit: "%",
        tol: 0.004,
        steps: [
          { title: "Fator gravimétrico", tex: r`\text{FG}=${T(fg, 4)}` },
          { title: "Massa de analito", tex: r`m=${TF(mp, 4)}\times${T(fg, 4)}=${TF(mp * fg, 4)}\ \text{g}` },
          { title: "Teor", result: `${NF(pct, 2)} %` },
        ],
      };
    },
  },

  /* ============================ NÍVEL 5 ============================ */
  {
    id: "g-beer-c",
    topic: "i-espectro",
    level: 5,
    difficulty: 1,
    title: "Concentração pela Lei de Beer",
    make: (g) => {
      const eps = g.pick([11100, 2400, 6220, 15400, 4500]), b = g.pick([1, 1, 2, 0.5]), A = g.num(0.15, 0.9, 3);
      const c = A / (eps * b);
      return {
        kind: "num",
        statement: `Uma solução apresenta A = ${NF(A, 3)} em cubeta de ${NF(b, 1)} cm. Sabendo que ε = ${eps.toLocaleString("pt-BR")} L mol⁻¹ cm⁻¹, calcule a concentração (mol/L).`,
        answer: c,
        unit: "mol/L",
        steps: [{ title: "Beer", tex: r`c=\frac{A}{\varepsilon b}=\frac{${TF(A, 3)}}{${eps}\times${T(b)}}=${T(c)}`, result: `${N(c)} mol/L` }],
      };
    },
  },
  {
    id: "g-beer-t",
    topic: "i-espectro",
    level: 5,
    difficulty: 1,
    title: "Transmitância ↔ absorbância",
    make: (g) => {
      const T0 = g.num(5, 90, 2);
      const A = 2 - log10(T0);
      return {
        kind: "num",
        statement: `Uma amostra transmite ${NF(T0, 1)} % da radiação incidente. Qual a absorbância?`,
        answer: A,
        absTol: 0.005,
        steps: [{ title: "A = −log T", tex: r`A=-\log(${T(T0 / 100, 3)})=2-\log(${T(T0)})=${TF(A, 3)}`, result: `A = ${NF(A, 3)}` }],
      };
    },
  },
  {
    id: "g-beer-mix",
    topic: "i-espectro",
    level: 5,
    difficulty: 3,
    title: "Mistura de dois componentes",
    make: (g) => {
      const eX1 = g.pick([4000, 3500, 5200]), eY1 = g.pick([500, 800, 300]), eX2 = g.pick([300, 600, 400]), eY2 = g.pick([3000, 2500, 4100]);
      const cX = g.num(5e-5, 2e-4, 2), cY = g.num(5e-5, 2e-4, 2);
      const A1 = +(eX1 * cX + eY1 * cY).toFixed(3), A2 = +(eX2 * cX + eY2 * cY).toFixed(3);
      const det = eX1 * eY2 - eY1 * eX2;
      const x = (A1 * eY2 - A2 * eY1) / det;
      return {
        kind: "num",
        statement: `Mistura de X e Y (b = 1 cm). Em λ₁: εX = ${eX1}, εY = ${eY1}; em λ₂: εX = ${eX2}, εY = ${eY2} (L mol⁻¹ cm⁻¹). Absorbâncias medidas: A₁ = ${NF(A1, 3)}, A₂ = ${NF(A2, 3)}. Calcule [X] (mol/L).`,
        answer: x,
        unit: "mol/L",
        tol: 0.02,
        steps: [
          { title: "Sistema", tex: r`\begin{cases}${TF(A1, 3)}=${eX1}c_X+${eY1}c_Y\\${TF(A2, 3)}=${eX2}c_X+${eY2}c_Y\end{cases}` },
          { title: "Regra de Cramer", tex: r`c_X=\frac{A_1\varepsilon_{Y2}-A_2\varepsilon_{Y1}}{\varepsilon_{X1}\varepsilon_{Y2}-\varepsilon_{Y1}\varepsilon_{X2}}=${T(x)}`, result: `[X] = ${N(x)} mol/L` },
        ],
      };
    },
  },
  {
    id: "g-cell-e",
    topic: "i-potenciometria",
    level: 5,
    difficulty: 2,
    title: "Potencial de célula (Nernst)",
    make: (g) => {
      const cZn = g.pick([0.001, 0.01, 0.1, 1]), cCu = g.pick([0.001, 0.01, 0.1, 1]);
      const E0 = 0.339 - -0.762;
      const E = E0 - (0.05916 / 2) * log10(cZn / cCu);
      return {
        kind: "num",
        statement: `Calcule o potencial da pilha Zn | Zn²⁺ (${N(cZn)} M) || Cu²⁺ (${N(cCu)} M) | Cu a 25 °C. E°(Cu²⁺/Cu) = 0,339 V; E°(Zn²⁺/Zn) = −0,762 V.`,
        answer: E,
        unit: "V",
        absTol: 0.004,
        steps: [
          { title: "E° da célula", tex: r`E^\circ=0{,}339-(-0{,}762)=1{,}101\ \text{V}` },
          { title: "Nernst (n = 2)", tex: r`E=1{,}101-\frac{0{,}05916}{2}\log\frac{${T(cZn)}}{${T(cCu)}}=${TF(E, 3)}\ \text{V}`, result: `E = ${NF(E, 3)} V` },
        ],
      };
    },
  },
  {
    id: "g-logk",
    topic: "i-potenciometria",
    level: 5,
    difficulty: 2,
    title: "K de equilíbrio a partir de E°",
    make: (g) => {
      const p = g.pick([
        { r: "Fe²⁺ + Ce⁴⁺ ⇌ Fe³⁺ + Ce³⁺", n: 1, dE: 1.44 - 0.68 },
        { r: "Zn + Cu²⁺ ⇌ Zn²⁺ + Cu", n: 2, dE: 1.101 },
        { r: "2Fe³⁺ + 2I⁻ ⇌ 2Fe²⁺ + I₂", n: 2, dE: 0.771 - 0.535 },
        { r: "Sn²⁺ + 2Fe³⁺ ⇌ Sn⁴⁺ + 2Fe²⁺", n: 2, dE: 0.771 - 0.139 },
      ]);
      const lk = logKfromE(p.n, p.dE);
      return {
        kind: "num",
        statement: `Calcule log K para ${p.r} a 25 °C, sabendo que ΔE° = ${NF(p.dE, 3)} V.`,
        answer: lk,
        absTol: 0.1,
        steps: [{ title: "Relação E°–K", tex: r`\log K=\frac{n\Delta E^\circ}{0{,}05916}=\frac{${p.n}\times${TF(p.dE, 3)}}{0{,}05916}=${TF(lk, 1)}`, result: `log K = ${NF(lk, 1)}` }],
      };
    },
  },
  {
    id: "g-glass-electrode",
    topic: "i-potenciometria",
    level: 5,
    difficulty: 1,
    title: "Eletrodo de vidro",
    make: (g) => {
      const pH1 = g.pick([4.01, 7.0, 10.01]), dpH = g.num(-2.5, 2.5, 2);
      const dE = -0.05916 * dpH * 1000;
      return {
        kind: "num",
        statement: `Num eletrodo de vidro ideal a 25 °C, o potencial variou ${NF(dE, 1)} mV ao passar de um tampão de pH ${NF(pH1)} para uma amostra. Qual o pH da amostra?`,
        answer: pH1 + dpH,
        absTol: 0.02,
        steps: [
          { title: "Resposta nernstiana", text: "E = K − 59,16 mV × pH → ΔpH = −ΔE / 59,16 mV" },
          { title: "ΔpH", tex: r`\Delta\text{pH}=-\frac{${TF(dE, 1)}}{59{,}16}=${TF(dpH)}`, result: `pH = ${NF(pH1 + dpH)}` },
        ],
      };
    },
  },
  {
    id: "g-chrom-n",
    topic: "i-cromatografia",
    level: 5,
    difficulty: 1,
    title: "Número de pratos",
    make: (g) => {
      const tR = g.num(3, 15, 3), w = g.num(0.1, 0.6, 2);
      const Nn = plates(tR, w);
      return {
        kind: "num",
        statement: `Um pico tem tR = ${NF(tR, 2)} min e largura na base w = ${NF(w, 2)} min. Calcule N.`,
        answer: Nn,
        tol: 0.02,
        steps: [{ title: "N = 16(tR/w)²", tex: r`N=16\left(\frac{${TF(tR)}}{${TF(w)}}\right)^2=${T(Nn, 4)}`, result: `N ≈ ${Math.round(Nn).toLocaleString("pt-BR")}` }],
      };
    },
  },
  {
    id: "g-chrom-rs",
    topic: "i-cromatografia",
    level: 5,
    difficulty: 2,
    title: "Resolução",
    make: (g) => {
      const t1 = g.num(4, 10, 3), dt = g.num(0.2, 1.2, 2), w1 = g.num(0.2, 0.5, 2), w2 = g.num(0.2, 0.55, 2);
      const Rs = resolution(t1, t1 + dt, w1, w2);
      return {
        kind: "num",
        statement: `Dois picos: tR₁ = ${NF(t1, 2)} min (w₁ = ${NF(w1, 2)} min) e tR₂ = ${NF(t1 + dt, 2)} min (w₂ = ${NF(w2, 2)} min). Calcule Rs.`,
        answer: Rs,
        tol: 0.02,
        steps: [
          { title: "Rs", tex: r`R_s=\frac{2(${TF(t1 + dt)}-${TF(t1)})}{${TF(w1)}+${TF(w2)}}=${TF(Rs)}` },
          { title: "Interpretação", result: Rs >= 1.5 ? "Rs ≥ 1,5: separação de linha de base" : "Rs < 1,5: separação incompleta" },
        ],
      };
    },
  },
  {
    id: "g-chrom-length",
    topic: "i-cromatografia",
    level: 5,
    difficulty: 3,
    title: "Comprimento de coluna para Rs desejada",
    make: (g) => {
      const Rs1 = g.num(0.7, 1.3, 2), L1 = g.pick([10, 15, 25, 30]);
      const L2 = L1 * (1.5 / Rs1) ** 2;
      return {
        kind: "num",
        statement: `Numa coluna de ${L1} cm obteve-se Rs = ${NF(Rs1, 2)}. Mantidos k e α, qual comprimento (cm) é necessário para Rs = 1,5?`,
        answer: L2,
        unit: "cm",
        tol: 0.02,
        steps: [
          { title: "Rs ∝ √N ∝ √L", tex: r`\frac{R_{s2}}{R_{s1}}=\sqrt{\frac{L_2}{L_1}}` },
          { title: "Isole L₂", tex: r`L_2=${L1}\left(\frac{1{,}5}{${TF(Rs1)}}\right)^2=${TF(L2, 1)}\ \text{cm}`, result: `${NF(L2, 1)} cm` },
        ],
      };
    },
  },
  {
    id: "g-chrom-k-alpha",
    topic: "i-cromatografia",
    level: 5,
    difficulty: 2,
    title: "Fator de seletividade",
    make: (g) => {
      const tM = g.num(0.8, 1.6, 2), t1 = g.num(4, 8, 3), t2 = t1 + g.num(0.3, 1.5, 2);
      const k1 = (t1 - tM) / tM, k2 = (t2 - tM) / tM;
      return {
        kind: "num",
        statement: `tM = ${NF(tM, 2)} min; tR₁ = ${NF(t1, 2)} min; tR₂ = ${NF(t2, 2)} min. Calcule o fator de seletividade α.`,
        answer: k2 / k1,
        tol: 0.01,
        steps: [
          { title: "Fatores de retenção", tex: r`k_1=${TF(k1)};\ k_2=${TF(k2)}` },
          { title: "α", tex: r`\alpha=\frac{k_2}{k_1}=${TF(k2 / k1, 3)}`, result: `α = ${NF(k2 / k1, 3)}` },
        ],
      };
    },
  },
];

