import { describe, expect, it } from "vitest";
import { solvePH, getWeak, pHAt, titrationCurve, alphas } from "../src/engine/acidbase";
import { alphaY4, edtaPM, argPoint, redoxE, solubility } from "../src/engine/equilibria";
import { tCrit, fCrit } from "../src/engine/math";
import { grubbs, linreg, tTestTwo } from "../src/engine/stats";
import { mm, parseFormula } from "../src/engine/stoich";

const weak = (id: string, C: number) => ({ name: id, pKa: getWeak(id).pKa, z: getWeak(id).z, C });

describe("ácido-base exato", () => {
  it("HOAc 0,1 M → pH 2,88", () => expect(solvePH({ weak: [weak("acetic", 0.1)], cations: 0, anions: 0 })).toBeCloseTo(2.88, 2));
  it("NH3 0,1 M → pH 11,13", () => expect(solvePH({ weak: [weak("ammonia", 0.1)], cations: 0, anions: 0 })).toBeCloseTo(11.12, 1));
  it("H3PO4 0,1 M → pH 1,63", () => expect(solvePH({ weak: [weak("phosphoric", 0.1)], cations: 0, anions: 0 })).toBeCloseTo(1.63, 1));
  it("HCl 1e-8 M → pH 6,98", () => expect(solvePH({ weak: [], cations: 0, anions: 1e-8 })).toBeCloseTo(6.98, 2));
  const setup = { analyte: { type: "weak" as const, entry: getWeak("acetic"), C: 0.1 }, Va: 50, titrant: { type: "strong-base" as const, C: 0.1 }, Vmax: 80 };
  it("meia equivalência pH = pKa", () => expect(pHAt(setup, 25)).toBeCloseTo(4.76, 1));
  it("equivalência HOAc pH 8,72", () => expect(pHAt(setup, 50)).toBeCloseTo(8.72, 1));
  it("curva tem pontos", () => expect(titrationCurve(setup).length).toBeGreaterThan(300));
  it("alphas somam 1", () => expect(alphas([2, 7, 12], 1e-7).reduce((a, b) => a + b)).toBeCloseTo(1, 10));
});

describe("equilíbrios", () => {
  it("αY4- pH 10 ≈ 0,30", () => expect(alphaY4(10)).toBeCloseTo(0.30, 1));
  it("pCa no PE ≈ 5,85", () => expect(edtaPM({ CM: 0.04, VM: 50, CY: 0.08, logKf: 10.65, pH: 10, Vmax: 40 }, 25)).toBeCloseTo(5.85, 1));
  it("pAg no PE AgCl = 4,87", () => expect(argPoint({ CX: 0.05, VX: 50, CAg: 0.1, Ksp: 1.8e-10, Vmax: 50 }, 25).pAg).toBeCloseTo(4.87, 2));
  it("Fe/Ce no PE = 1,06 V", () => expect(redoxE({ label: "", E1: 0.68, n1: 1, E2: 1.44, n2: 1, C1: 0.05, V1: 50, C2: 0.1, Vmax: 50 }, 25)).toBeCloseTo(1.06, 2));
  it("Fe/Ce a 50% = E°Fe", () => expect(redoxE({ label: "", E1: 0.68, n1: 1, E2: 1.44, n2: 1, C1: 0.05, V1: 50, C2: 0.1, Vmax: 50 }, 12.5)).toBeCloseTo(0.68, 3));
  it("s AgCl = 1,34e-5", () => expect(solubility(1.8e-10, 1, 1) / 1e-5).toBeCloseTo(1.342, 2));
  it("s Ag2CrO4 = 6,7e-5", () => expect(solubility(1.2e-12, 2, 1) / 1e-5).toBeCloseTo(6.69, 1));
});

describe("estatística", () => {
  it("t(95%, 4) = 2,776", () => expect(tCrit(0.95, 4)).toBeCloseTo(2.776, 3));
  it("t(95%, 10) = 2,228", () => expect(tCrit(0.95, 10)).toBeCloseTo(2.228, 3));
  it("F(0,05; 4,4) = 6,39", () => expect(fCrit(0.05, 4, 4)).toBeCloseTo(6.39, 2));
  it("Grubbs n=5 Gcrit = 1,715", () => expect(grubbs([1, 2, 3, 4, 10]).Gcrit).toBeCloseTo(1.715, 2));
  it("regressão perfeita", () => { const r = linreg([1, 2, 3, 4], [2, 4, 6, 8]); expect(r.slope).toBeCloseTo(2); expect(r.r2).toBeCloseTo(1); });
  it("t duas médias", () => expect(tTestTwo([10.1, 10.2, 10.0, 10.1], [10.5, 10.6, 10.4, 10.5]).significant).toBe(true));
});

describe("estequiometria", () => {
  it("H2SO4 = 98,08", () => expect(mm("H2SO4")).toBeCloseTo(98.08, 1));
  it("CuSO4·5H2O = 249,7", () => expect(mm("CuSO4·5H2O")).toBeCloseTo(249.69, 0));
  it("K4[Fe(CN)6]", () => expect(parseFormula("K4[Fe(CN)6]")).toEqual({ K: 4, Fe: 1, C: 6, N: 6 }));
  it("(NH4)2SO4 = 132,14", () => expect(mm("(NH4)2SO4")).toBeCloseTo(132.14, 1));
});
