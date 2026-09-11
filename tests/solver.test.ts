import { describe, expect, it } from "vitest";
import { parseProblem, solve } from "../src/engine/solver";
import { presets } from "../src/engine/presets";
import type { Problem } from "../src/engine/types";
describe("GPS semantics", () => {
  it("finds the reference monkey plan, replays valid operators and does not mutate input", () => {
    const p = structuredClone(presets[0].problem),
      before = JSON.stringify(p),
      r = solve(p);
    expect(r.status).toBe("solved");
    expect(r.plan.map((s) => s.action)).toEqual([
      "push chair from door to middle room",
      "climb on chair",
      "drop ball",
      "grasp bananas",
      "eat bananas",
    ]);
    let state = [...p.start];
    for (const step of r.plan) {
      const op = p.ops.find((o) => o.action === step.action)!;
      expect(op.preconds.every((f) => state.includes(f))).toBe(true);
      state = [
        ...new Set([...state.filter((f) => !op.delete.includes(f)), ...op.add]),
      ];
      expect(step.after).toEqual(state);
    }
    expect(p.finish.every((f) => state.includes(f))).toBe(true);
    expect(JSON.stringify(p)).toBe(before);
    expect(solve(p).plan).toEqual(r.plan);
  });
  it("keeps rejected branch effects and actions out of the selected plan", () => {
    const p: Problem = {
      start: ["ready"],
      finish: ["goal"],
      ops: [
        {
          action: "bad",
          preconds: ["side effect", "impossible"],
          add: ["goal"],
          delete: [],
        },
        {
          action: "prepare",
          preconds: ["ready"],
          add: ["side effect"],
          delete: [],
        },
        { action: "good", preconds: ["ready"], add: ["goal"], delete: [] },
      ],
    };
    const r = solve(p);
    expect(r.status).toBe("solved");
    expect(r.plan.map((s) => s.action)).toEqual(["good"]);
    expect(r.final).not.toContain("side effect");
    expect(r.trace.some((s) => s.kind === "backtrack")).toBe(true);
  });
  it("exposes goal-order incompleteness without claiming unsolvability", () => {
    const p = structuredClone(presets[3].problem);
    expect(solve(p).status).toBe("failed");
    p.finish.reverse();
    expect(solve(p).status).toBe("solved");
    const clobber: Problem = {
      start: [],
      finish: ["a", "b"],
      ops: [
        { action: "a", preconds: [], add: ["a"], delete: [] },
        { action: "b", preconds: [], add: ["b"], delete: ["a"] },
      ],
    };
    const r = solve(clobber);
    expect(r.status).toBe("failed");
    expect(r.trace.some((s) => s.kind === "conflict")).toBe(true);
  });
  it("detects recursion and distinguishes limits from exhausted searches", () => {
    const p: Problem = {
      start: [],
      finish: ["a"],
      ops: [
        { action: "a", preconds: ["b"], add: ["a"], delete: [] },
        { action: "b", preconds: ["a"], add: ["b"], delete: [] },
      ],
    };
    expect(solve(p).trace.some((s) => s.kind === "cycle")).toBe(true);
    expect(solve(p).status).toBe("failed");
    expect(solve(p, 2).status).toBe("limited");
  });
  it("accepts empty states and empty goals as legitimate states", () => {
    expect(solve({ start: [], finish: [], ops: [] }).status).toBe("solved");
    expect(
      solve({
        start: [],
        finish: ["ready"],
        ops: [{ action: "start", preconds: [], add: ["ready"], delete: [] }],
      }).status,
    ).toBe("solved");
  });
  it("validates imported problems and solves the remaining successful presets", () => {
    expect(() =>
      parseProblem('{"start":[],"finish":[],"ops":[{"action":"invalid"}]}'),
    ).toThrow();
    expect(
      parseProblem('{"start":["准备"],"finish":["完成"],"ops":[]}').start,
    ).toEqual(["准备"]);
    for (const preset of presets.slice(1, 3))
      expect(solve(preset.problem).status).toBe("solved");
  });
});
