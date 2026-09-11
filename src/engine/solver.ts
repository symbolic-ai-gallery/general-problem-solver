import type { Problem, PlanStep, Result, TraceStep } from "./types";
type Branch = { state: string[]; plan: PlanStep[] };
class SearchLimit extends Error {}
// A goal-stack, means–ends solver. Operator and goal order are deliberate:
// like the teaching GPS, this is not a complete or optimal planning algorithm.
export function solve(problem: Problem, maxEvents = 3000): Result {
  const trace: TraceStep[] = [];
  let visited = 0;
  function emit(event: TraceStep) {
    if (trace.length >= maxEvents) throw new SearchLimit();
    trace.push({ ...event, state: [...event.state], stack: [...event.stack] });
  }
  function achieveAll(
    branch: Branch,
    goals: string[],
    stack: string[],
  ): Branch | null {
    let current: Branch | null = branch;
    for (const goal of goals) {
      current = achieve(current, goal, stack);
      if (!current) return null;
    }
    const lost = goals.find((goal) => !current!.state.includes(goal));
    if (lost) {
      emit({ kind: "conflict", goal: lost, stack, state: current.state });
      return null;
    }
    return current;
  }
  function achieve(
    branch: Branch,
    goal: string,
    stack: string[],
  ): Branch | null {
    visited++;
    const path = [...stack, goal];
    emit({ kind: "goal", goal, stack: path, state: branch.state });
    if (branch.state.includes(goal)) {
      emit({ kind: "satisfied", goal, stack: path, state: branch.state });
      return branch;
    }
    if (stack.includes(goal)) {
      emit({ kind: "cycle", goal, stack: path, state: branch.state });
      return null;
    }
    if (stack.length >= 64) throw new SearchLimit();
    for (const op of problem.ops.filter((op) => op.add.includes(goal))) {
      emit({
        kind: "consider",
        action: op.action,
        goal,
        stack: path,
        state: branch.state,
      });
      const ready = achieveAll(branch, op.preconds, path);
      if (ready) {
        const state = [
          ...new Set([
            ...ready.state.filter((f) => !op.delete.includes(f)),
            ...op.add,
          ]),
        ];
        const step: PlanStep = {
          action: op.action,
          before: ready.state,
          after: state,
          added: state.filter((f) => !ready.state.includes(f)),
          removed: ready.state.filter((f) => !state.includes(f)),
        };
        emit({
          kind: "apply",
          action: op.action,
          goal,
          stack: path,
          state,
          added: step.added,
          removed: step.removed,
        });
        return { state, plan: [...ready.plan, step] };
      }
      emit({
        kind: "backtrack",
        action: op.action,
        goal,
        stack: path,
        state: branch.state,
      });
    }
    emit({ kind: "dead-end", goal, stack: path, state: branch.state });
    return null;
  }
  try {
    const found = achieveAll(
      { state: [...problem.start], plan: [] },
      problem.finish,
      [],
    );
    emit({
      kind: found ? "success" : "failure",
      stack: [],
      state: found?.state ?? problem.start,
    });
    return {
      status: found ? "solved" : "failed",
      plan: found?.plan ?? [],
      trace,
      final: found?.state ?? [...problem.start],
      visited,
    };
  } catch (error) {
    if (!(error instanceof SearchLimit)) throw error;
    trace.push({ kind: "limit", stack: [], state: [...problem.start] });
    return {
      status: "limited",
      plan: [],
      trace,
      final: [...problem.start],
      visited,
    };
  }
}
export function parseProblem(input: string): Problem {
  if (input.length > 100000) throw new Error("JSON exceeds 100 KB.");
  const value: unknown = JSON.parse(input);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected an object with start, finish and ops.");
  const raw = value as Record<string, unknown>;
  function facts(value: unknown, path: string): string[] {
    if (
      !Array.isArray(value) ||
      value.length > 128 ||
      value.some((f) => typeof f !== "string" || !f.trim() || f.length > 160)
    )
      throw new Error(
        path +
          " must contain up to 128 non-empty strings (160 characters each).",
      );
    return [...new Set((value as string[]).map((f) => f.trim()))];
  }
  if (!Array.isArray(raw.ops) || raw.ops.length > 128)
    throw new Error("ops must be an array of up to 128 operators.");
  const ops = raw.ops.map((entry: unknown, i) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry))
      throw new Error("Invalid operator at index " + i);
    const op = entry as Record<string, unknown>;
    if (
      typeof op.action !== "string" ||
      !op.action.trim() ||
      op.action.length > 160
    )
      throw new Error("Operator action must be a non-empty string.");
    return {
      action: op.action.trim(),
      preconds: facts(op.preconds, "ops[" + i + "].preconds"),
      add: facts(op.add, "ops[" + i + "].add"),
      delete: facts(op.delete, "ops[" + i + "].delete"),
    };
  });
  if (new Set(ops.map((op) => op.action)).size !== ops.length)
    throw new Error("Operator action names must be unique.");
  return {
    start: facts(raw.start, "start"),
    finish: facts(raw.finish, "finish"),
    ops,
  };
}
