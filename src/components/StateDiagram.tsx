import { useEffect } from "react";
import type { Problem } from "../engine/types";
import { label } from "../engine/presets";
type Props = {
  id: string;
  problem: Problem;
  state: string[];
  zh: boolean;
  frameId: string;
  onComplete: (id: string) => void;
};
export default function StateDiagram({
  id,
  problem,
  state,
  zh,
  frameId,
  onComplete,
}: Props) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => onComplete(frameId));
    return () => cancelAnimationFrame(frame);
  }, [frameId, onComplete]);
  if (id === "maze") {
    const nodes = [
      ["A", 80, 160],
      ["B", 200, 160],
      ["C", 200, 55],
      ["D", 320, 160],
      ["E", 440, 160],
      ["F", 440, 285],
    ] as const;
    const get = (key: string) => nodes.find((n) => n[0] === key)!;
    return (
      <svg
        className="route-map"
        viewBox="0 0 520 340"
        role="img"
        aria-label={
          zh
            ? "A 到 F 的路线与当前位置"
            : "Route from A to F and current position"
        }
      >
        {[
          ["A", "B"],
          ["B", "C"],
          ["B", "D"],
          ["D", "E"],
          ["E", "F"],
        ].map(([a, b]) => (
          <line
            key={a + b}
            x1={get(a)[1]}
            y1={get(a)[2]}
            x2={get(b)[1]}
            y2={get(b)[2]}
            className="route-line"
          />
        ))}
        {nodes.map(([name, x, y]) => (
          <g
            key={name}
            transform={`translate(${x},${y})`}
            className={
              state.includes("at " + name) ? "map-node active" : "map-node"
            }
          >
            <circle r="25" />
            <text dy="6" textAnchor="middle">
              {name}
            </text>
            {problem.finish.includes("at " + name) && (
              <circle r="32" className="target-ring" />
            )}
          </g>
        ))}
      </svg>
    );
  }
  const facts = [
    ...new Set([
      ...problem.start,
      ...problem.finish,
      ...problem.ops.flatMap((op) => op.add),
    ]),
  ];
  return (
    <div className="fact-board">
      {facts.map((fact) => (
        <div
          key={fact}
          className={`fact-tile ${state.includes(fact) ? "present" : ""} ${problem.finish.includes(fact) ? "goal-tile" : ""}`}
        >
          <span className="fact-light" />
          <span>{label(fact, zh)}</span>
          {problem.finish.includes(fact) && (
            <small>{zh ? "目标" : "Goal"}</small>
          )}
        </div>
      ))}
    </div>
  );
}
