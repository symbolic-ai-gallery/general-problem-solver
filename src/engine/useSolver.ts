import { useEffect, useRef, useState } from "react";
import type { Problem, Result } from "./types";
export function useSolver() {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const worker = useRef<Worker | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const counter = useRef(0);
  function cancel() {
    counter.current++;
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
    setBusy(false);
  }
  function clear() {
    cancel();
    setResult(null);
    setError("");
  }
  function run(problem: Problem) {
    cancel();
    setResult(null);
    setError("");
    setBusy(true);
    const id = counter.current;
    const w = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = w;
    const finish = () => {
      clearTimeout(timer.current);
      w.terminate();
      if (worker.current === w) worker.current = null;
      setBusy(false);
    };
    w.onmessage = (event) => {
      if (id !== counter.current) return;
      setResult(event.data.result ?? null);
      setError(event.data.error ?? "");
      finish();
    };
    w.onerror = (event) => {
      if (id !== counter.current) return;
      setError(event.message || "Worker failed.");
      finish();
    };
    timer.current = setTimeout(() => {
      if (id !== counter.current) return;
      setError("Search timed out (10 seconds).");
      finish();
    }, 10000);
    w.postMessage({ id, problem: JSON.stringify(problem) });
  }
  useEffect(
    () => () => {
      worker.current?.terminate();
      clearTimeout(timer.current);
    },
    [],
  );
  return { result, busy, error, run, clear, cancel };
}
