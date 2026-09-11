export type Operator = {
  action: string;
  preconds: string[];
  add: string[];
  delete: string[];
};
export type Problem = { start: string[]; finish: string[]; ops: Operator[] };
export type PlanStep = {
  action: string;
  before: string[];
  after: string[];
  added: string[];
  removed: string[];
};
export type TraceKind =
  | "goal"
  | "satisfied"
  | "consider"
  | "apply"
  | "cycle"
  | "backtrack"
  | "conflict"
  | "dead-end"
  | "success"
  | "failure"
  | "limit";
export type TraceStep = {
  kind: TraceKind;
  goal?: string;
  action?: string;
  stack: string[];
  state: string[];
  added?: string[];
  removed?: string[];
};
export type Result = {
  status: "solved" | "failed" | "limited";
  plan: PlanStep[];
  trace: TraceStep[];
  final: string[];
  visited: number;
};
export type Preset = { id: string; title: [string, string]; problem: Problem };
