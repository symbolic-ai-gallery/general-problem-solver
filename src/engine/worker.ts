import { parseProblem, solve } from "./solver";
self.onmessage = (event: MessageEvent<{ id: number; problem: string }>) => {
  try {
    const problem = parseProblem(event.data.problem);
    self.postMessage({ id: event.data.id, result: solve(problem) });
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
