import { describe, expect, it } from "vitest";
import { GENERATORS, FIXED, instantiate, drawQuestions, EXAM_PRESETS } from "../src/data/questions";
import { checkNumeric } from "../src/data/questions/types";
import { TOPIC_BY_ID } from "../src/data/curriculum";

describe("geradores", () => {
  for (const g of GENERATORS) {
    it(g.id, () => {
      expect(TOPIC_BY_ID[g.topic]).toBeDefined();
      for (let s = 1; s <= 60; s++) {
        const q = instantiate(`gen:${g.id}:${s * 7919}`)!;
        expect(q).not.toBeNull();
        const blob = JSON.stringify(q);
        expect(blob).not.toMatch(/\bNaN\b|undefined|Infinity/);
        if (q.kind === "num") {
          expect(Number.isFinite(q.answer)).toBe(true);
          expect(checkNumeric(q, q.answer!)).toBe(true);
        } else {
          expect(q.options!.length).toBeGreaterThanOrEqual(2);
          expect(q.correct).toBeGreaterThanOrEqual(0);
        }
      }
    });
  }
});

describe("banco", () => {
  it("conceituais têm tópico válido", () => FIXED.forEach((q) => expect(TOPIC_BY_ID[q.topic], q.topic).toBeDefined()));
  it("todo tópico tem questões", () => {
    for (const t of Object.keys(TOPIC_BY_ID)) {
      const n = GENERATORS.filter((g) => g.topic === t).length + FIXED.filter((q) => q.topic === t).length;
      expect(n, t).toBeGreaterThan(2);
    }
  });
  it("provas sorteiam o nº pedido", () => EXAM_PRESETS.forEach((p) => expect(drawQuestions(p.pool, p.count, 42).length).toBe(p.count)));
  it("contagem", () => console.log(`geradores=${GENERATORS.length} conceituais=${FIXED.length}`));
});
