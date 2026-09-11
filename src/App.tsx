import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileJson,
  Globe2,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Scan,
  SkipBack,
  SkipForward,
  Square,
  X,
} from "lucide-react";
import { ThemeToggle, useTheme } from "./components/Theme";
import ComposerDock from "./components/ComposerDock";
import WorldScene from "./components/WorldScene";
import StateDiagram from "./components/StateDiagram";
import { presets, label } from "./engine/presets";
import { parseProblem } from "./engine/solver";
import { useSolver } from "./engine/useSolver";
import type { Problem, TraceKind } from "./engine/types";
const kindNames: Record<TraceKind, [string, string]> = {
  goal: ["尝试目标", "Goal"],
  satisfied: ["已满足", "Satisfied"],
  consider: ["考虑操作", "Consider"],
  apply: ["应用操作", "Apply"],
  cycle: ["循环目标", "Cycle"],
  backtrack: ["回退分支", "Backtrack"],
  conflict: ["目标被破坏", "Clobbered goal"],
  "dead-end": ["没有可用操作", "Dead end"],
  success: ["所有目标成立", "All goals hold"],
  failure: ["未找到计划", "No plan found"],
  limit: ["达到搜索上限", "Search limit"],
};
export default function App() {
  const [zh, setZh] = useState(true),
    [presetId, setPresetId] = useState("monkey"),
    [problem, setProblem] = useState<Problem>(presets[0].problem);
  const [tab, setTab] = useState<"plan" | "trace" | "model">("plan"),
    [mode, setMode] = useState<"plan" | "trace">("plan"),
    [cursor, setCursor] = useState(0),
    [revision, setRevision] = useState(0);
  const [playing, setPlaying] = useState(false),
    [motionPaused, setMotionPaused] = useState(false),
    [settledFrame, setSettledFrame] = useState<string | null>(null),
    [speed, setSpeed] = useState(1),
    [camera, setCamera] = useState({ id: 0, kind: "reset" });
  const [dialog, setDialog] = useState(false),
    [draft, setDraft] = useState(""),
    [editError, setEditError] = useState("");
  const { dark } = useTheme(),
    { result, busy, error, run, clear, cancel } = useSolver();
  const shell = useRef<HTMLDivElement>(null),
    activeRow = useRef<HTMLButtonElement>(null),
    importInput = useRef<HTMLInputElement>(null);
  const t = (a: string, b: string) => (zh ? a : b),
    L = (value: string) => label(value, zh);
  const last =
    mode === "plan"
      ? (result?.plan.length ?? 0)
      : Math.max(0, (result?.trace.length ?? 1) - 1);
  const planStep = mode === "plan" ? result?.plan[cursor - 1] : undefined,
    traceStep = mode === "trace" ? result?.trace[cursor] : undefined;
  const state = planStep?.after ?? traceStep?.state ?? problem.start,
    action = planStep?.action ?? traceStep?.action;
  const frameId = `${revision}:${mode}:${cursor}`;
  const settled = settledFrame === frameId;
  const frameRef = useRef(frameId);
  frameRef.current = frameId;
  const onComplete = useCallback((id: string) => {
    if (frameRef.current === id) setSettledFrame(id);
  }, []);
  const added = planStep?.added ?? traceStep?.added ?? [],
    removed = planStep?.removed ?? traceStep?.removed ?? [];
  const selectedOperator = problem.ops.find((op) => op.action === action);
  const preset = presets.find((p) => p.id === presetId);
  useEffect(() => {
    const viewport = window.visualViewport;
    const fit = () => {
      const root = shell.current;
      if (!root) return;
      root.style.setProperty(
        "--app-height",
        `${viewport?.height ?? innerHeight}px`,
      );
      root.style.setProperty("--viewport-top", `${viewport?.offsetTop ?? 0}px`);
      document.documentElement.style.setProperty(
        "--visible-height",
        `${viewport?.height ?? innerHeight}px`,
      );
      document.documentElement.style.setProperty(
        "--visual-top",
        `${viewport?.offsetTop ?? 0}px`,
      );
      root.dataset.keyboard = String(
        (viewport?.height ?? innerHeight) < innerHeight * 0.78,
      );
    };
    fit();
    viewport?.addEventListener("resize", fit);
    viewport?.addEventListener("scroll", fit);
    window.addEventListener("resize", fit);
    return () => {
      viewport?.removeEventListener("resize", fit);
      viewport?.removeEventListener("scroll", fit);
      window.removeEventListener("resize", fit);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = zh ? "zh-CN" : "en";
  }, [zh]);
  useEffect(() => {
    if (!result) return;
    setPlaying(false);
    setCursor(0);
    setRevision((n) => n + 1);
    if (result.status !== "solved") {
      setTab("trace");
      setMode("trace");
    }
  }, [result]);
  useEffect(() => {
    if (!playing || !settled || !result) return;
    if (cursor >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setCursor((n) => n + 1), 450 / speed);
    return () => clearTimeout(timer);
  }, [playing, settled, cursor, last, speed, result]);
  useEffect(() => {
    const row = activeRow.current;
    if (row) {
      const parent = row.closest(".panel-scroll");
      if (parent) {
        const rect = row.getBoundingClientRect(),
          container = parent.getBoundingClientRect();
        if (rect.top < container.top || rect.bottom > container.bottom)
          parent.scrollTop += rect.top - container.top - 30;
      }
    }
  }, [cursor, tab]);
  function seek(value: number) {
    setMotionPaused(false);
    setPlaying(false);
    setCursor(Math.max(0, Math.min(last, value)));
  }
  function switchTab(value: typeof tab) {
    setTab(value);
    if (value !== "model" && value !== mode) {
      setMode(value);
      setCursor(0);
      setMotionPaused(false);
      setPlaying(false);
    }
  }
  function solveNow(p = problem) {
    setMotionPaused(false);
    setCursor(0);
    setPlaying(false);
    setMode("plan");
    setTab("plan");
    setRevision((n) => n + 1);
    run(p);
  }
  function choose(id: string) {
    setMotionPaused(false);
    const next = presets.find((p) => p.id === id)!;
    clear();
    setProblem(structuredClone(next.problem));
    setPresetId(id);
    setCursor(0);
    setPlaying(false);
    setMode("plan");
    setTab("plan");
    setRevision((n) => n + 1);
  }
  function edit() {
    setDraft(JSON.stringify(problem, null, 2));
    setEditError("");
    setPlaying(false);
    setDialog(true);
  }
  function download(data: unknown, name: string) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function applyDraft() {
    try {
      const next = parseProblem(draft);
      setProblem(next);
      setPresetId("custom");
      setDialog(false);
      solveNow(next);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : String(e));
    }
  }
  function FactList({ facts }: { facts: string[] }) {
    return (
      <div className="facts">
        {facts.map((f) => (
          <span key={f} className={state.includes(f) ? "fact true" : "fact"}>
            <span>{state.includes(f) ? "●" : "○"}</span>
            {L(f)}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="lab" ref={shell}>
      <header className="lab-header">
        <a
          href="#"
          className="lab-home"
          aria-label={t("返回背景页", "Back to background")}
        >
          <ArrowLeft />
          <strong>GPS</strong>
        </a>
        <Menu.Root>
          <Menu.Trigger className="ui-button problem-trigger">
            {preset?.title[zh ? 0 : 1] ?? t("自定义问题", "Custom problem")}
            <ChevronDown />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={6}>
              <Menu.Popup className="ui-menu">
                {presets.map((p) => (
                  <Menu.Item
                    key={p.id}
                    className="ui-menu-item"
                    onClick={() => choose(p.id)}
                  >
                    {p.title[zh ? 0 : 1]}
                    {presetId === p.id && <Check />}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        <div className="header-actions">
          <ThemeToggle zh={zh} />
          <Button
            className="ui-button icon ghost"
            onClick={edit}
            aria-label={t("编辑问题", "Edit problem")}
            title={t("编辑问题", "Edit problem")}
          >
            <FileJson />
          </Button>
          <Menu.Root>
            <Menu.Trigger
              className="ui-button icon ghost"
              aria-label={t("更多操作", "More actions")}
            >
              <MoreHorizontal />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner align="end" sideOffset={6}>
                <Menu.Popup className="ui-menu">
                  <Menu.Item
                    className="ui-menu-item"
                    onClick={() => setZh(!zh)}
                  >
                    <Globe2 />
                    {zh ? "English" : "中文"}
                  </Menu.Item>
                  <Menu.Item
                    className="ui-menu-item"
                    onClick={() => download(problem, "gps-problem.json")}
                  >
                    <Download />
                    {t("导出问题", "Export problem")}
                  </Menu.Item>
                  <Menu.Item
                    className="ui-menu-item"
                    disabled={!result}
                    onClick={() =>
                      download({ problem, ...result }, "gps-result.json")
                    }
                  >
                    <Download />
                    {t("导出计划与搜索记录", "Export plan and trace")}
                  </Menu.Item>
                  <Menu.Item
                    className="ui-menu-item"
                    onClick={() => {
                      clear();
                      setCursor(0);
                      setPlaying(false);
                      setRevision((n) => n + 1);
                    }}
                  >
                    <RotateCcw />
                    {t("清除求解结果", "Clear result")}
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>
      </header>
      <main className="workspace">
        <section
          className="world-panel"
          aria-label={t("问题状态", "Problem state")}
        >
          <div className="world-heading">
            <span>
              {mode === "trace" && result
                ? t("搜索分支状态", "Search branch state")
                : cursor === 0
                  ? t("初始状态", "Initial state")
                  : L(action ?? "")}
            </span>
            {presetId === "monkey" && (
              <Menu.Root>
                <Menu.Trigger
                  className="ui-button icon surface"
                  aria-label={t("视角控制", "Camera controls")}
                >
                  <Scan />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner align="end" sideOffset={6}>
                    <Menu.Popup className="ui-menu">
                      {[
                        ["reset", "复位视角", "Reset view"],
                        ["in", "放大", "Zoom in"],
                        ["out", "缩小", "Zoom out"],
                        ["left", "向左旋转", "Rotate left"],
                        ["right", "向右旋转", "Rotate right"],
                      ].map(([kind, cn, en]) => (
                        <Menu.Item
                          className="ui-menu-item"
                          key={kind}
                          onClick={() =>
                            setCamera((c) => ({ id: c.id + 1, kind }))
                          }
                        >
                          {t(cn, en)}
                        </Menu.Item>
                      ))}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
            )}
          </div>
          {presetId === "monkey" ? (
            <WorldScene
              key={presetId + revision}
              state={state}
              frameId={frameId}
              action={action}
              paused={motionPaused}
              speed={speed}
              dark={dark}
              onComplete={onComplete}
              cameraReset={camera.id}
              cameraKind={camera.kind}
            />
          ) : (
            <StateDiagram
              id={presetId}
              problem={problem}
              state={state}
              frameId={frameId}
              onComplete={onComplete}
              zh={zh}
            />
          )}
          <div className="world-goals" aria-label={t("目标", "Goals")}>
            <span>{t("目标", "Goals")}</span>
            {problem.finish.length ? (
              problem.finish.map((f) => (
                <span
                  className={state.includes(f) ? "goal met" : "goal"}
                  key={f}
                >
                  {state.includes(f) ? (
                    <Check />
                  ) : (
                    <span className="goal-circle" />
                  )}
                  {L(f)}
                </span>
              ))
            ) : (
              <span>{t("空目标集合", "Empty goal set")}</span>
            )}
          </div>
        </section>
        <section
          className="details-panel"
          aria-label={t("求解详情", "Solver details")}
        >
          <div
            className="panel-tabs"
            role="tablist"
            aria-label={t("查看内容", "View")}
          >
            {(["plan", "trace", "model"] as const).map((value, i) => (
              <Button
                key={value}
                role="tab"
                aria-selected={tab === value}
                tabIndex={tab === value ? 0 : -1}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const values = ["plan", "trace", "model"] as const;
                  const next = (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                  switchTab(values[next]);
                  (
                    e.currentTarget.parentElement?.children[
                      next
                    ] as HTMLButtonElement
                  )?.focus();
                }}
                aria-controls="details-content"
                className={tab === value ? "panel-tab active" : "panel-tab"}
                onClick={() => switchTab(value)}
              >
                {
                  [
                    ["计划", "Plan"],
                    ["搜索", "Search"],
                    ["问题", "Problem"],
                  ][i][zh ? 0 : 1]
                }
                {result && value !== "model" && (
                  <span>
                    {value === "plan"
                      ? result.plan.length
                      : result.trace.length}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <div className="panel-scroll" id="details-content" role="tabpanel">
            {error && (
              <div className="notice error" role="alert">
                {error}
              </div>
            )}
            {result && (
              <div className={`result-summary ${result.status}`} role="status">
                <span className="status-dot" />
                {result.status === "solved"
                  ? t("已找到计划", "Plan found")
                  : result.status === "limited"
                    ? t("达到搜索上限", "Search limit reached")
                    : t(
                        "该搜索顺序未找到计划",
                        "No plan found in this search order",
                      )}
                {result.status === "solved" && (
                  <span>
                    {result.plan.length} {t("步", "steps")}
                  </span>
                )}
              </div>
            )}
            {tab === "plan" && (
              <>
                {!result && (
                  <div className="empty-state">
                    <p>{t("目标", "Goals")}</p>
                    <FactList facts={problem.finish} />
                    <Button
                      className="ui-button primary"
                      onClick={() => solveNow()}
                      disabled={busy}
                    >
                      {busy ? t("求解中…", "Solving…") : t("求解", "Solve")}
                    </Button>
                  </div>
                )}
                {result?.status === "solved" && (
                  <div className="step-list">
                    <Button
                      className={
                        cursor === 0 ? "step-row selected" : "step-row"
                      }
                      onClick={() => seek(0)}
                      ref={cursor === 0 ? activeRow : undefined}
                    >
                      <span className="step-no">0</span>
                      <span>{t("初始状态", "Initial state")}</span>
                    </Button>
                    {result.plan.map((step, i) => (
                      <Button
                        key={i}
                        className={
                          cursor === i + 1 ? "step-row selected" : "step-row"
                        }
                        ref={cursor === i + 1 ? activeRow : undefined}
                        onClick={() => seek(i + 1)}
                      >
                        <span className="step-no">{i + 1}</span>
                        <span>{L(step.action)}</span>
                        <span className="step-check">
                          {cursor > i && <Check />}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
                {result && result.status !== "solved" && (
                  <div className="notice">
                    <p>
                      {t(
                        "这不等于问题无解。GPS 按给定顺序尝试目标和操作符；可检查搜索记录，或编辑目标顺序后重新求解。",
                        "This does not prove that no solution exists. Inspect the search, or edit the goal order and solve again.",
                      )}
                    </p>
                    <Button
                      className="ui-button"
                      onClick={() => switchTab("trace")}
                    >
                      {t("查看搜索", "Inspect search")}
                    </Button>
                  </div>
                )}
                {result?.status === "solved" && result.plan.length === 0 && (
                  <p className="notice">
                    {t(
                      "初始状态已经满足所有目标，无需操作。",
                      "The initial state already satisfies every goal. No action is needed.",
                    )}
                  </p>
                )}
              </>
            )}
            {tab === "trace" && (
              <>
                {!result ? (
                  <div className="empty-state">
                    <Button
                      className="ui-button primary"
                      onClick={() => solveNow()}
                      disabled={busy}
                    >
                      {t("求解并记录搜索", "Solve and record search")}
                    </Button>
                  </div>
                ) : (
                  <div className="trace-list">
                    {result.trace.map((step, i) => (
                      <Button
                        key={i}
                        ref={cursor === i ? activeRow : undefined}
                        className={`trace-row ${cursor === i ? "selected" : ""} ${step.kind}`}
                        onClick={() => seek(i)}
                        style={
                          {
                            "--depth": Math.min(step.stack.length, 6),
                          } as CSSProperties
                        }
                      >
                        <span className="trace-line-no">{i + 1}</span>
                        <span>
                          <small>{kindNames[step.kind][zh ? 0 : 1]}</small>
                          <span>{L(step.action ?? step.goal ?? "")}</span>
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
            {tab === "model" && (
              <>
                <div className="section-title">
                  <h2>{t("当前事实", "Current facts")}</h2>
                  <Button className="ui-button ghost" onClick={edit}>
                    {t("编辑", "Edit")}
                  </Button>
                </div>
                <FactList facts={state} />
                {removed.length > 0 && (
                  <div className="removed-facts">
                    {removed.map((f) => (
                      <del key={f}>− {L(f)}</del>
                    ))}
                  </div>
                )}
                <div className="section-title">
                  <h2>{t("操作符", "Operators")}</h2>
                  <span>{problem.ops.length}</span>
                </div>
                {problem.ops.map((op) => (
                  <details key={op.action} className="operator">
                    <summary>{L(op.action)}</summary>
                    <dl>
                      <dt>{t("前置条件", "Preconditions")}</dt>
                      <dd>
                        <FactList facts={op.preconds} />
                      </dd>
                      <dt>{t("添加", "Add")}</dt>
                      <dd>{op.add.map(L).join(" · ") || "∅"}</dd>
                      <dt>{t("删除", "Delete")}</dt>
                      <dd>{op.delete.map(L).join(" · ") || "∅"}</dd>
                    </dl>
                  </details>
                ))}
              </>
            )}
          </div>
          {tab !== "model" && result && (
            <div className="step-inspector">
              {mode === "trace" && (
                <div className="goal-stack">
                  <span>{t("目标栈", "Goal stack")}</span>
                  <p>{traceStep?.stack.map(L).join(" › ") || "∅"}</p>
                </div>
              )}
              {selectedOperator && (
                <details>
                  <summary>
                    {t("当前操作与状态变化", "Current operator and changes")}
                  </summary>
                  <p>{L(selectedOperator.action)}</p>
                  <div className="delta">
                    <span>
                      {added.length
                        ? "+ " + added.map(L).join(" · ")
                        : t("无新增事实", "No added facts")}
                    </span>
                    {removed.length > 0 && (
                      <del>− {removed.map(L).join(" · ")}</del>
                    )}
                  </div>
                </details>
              )}
            </div>
          )}
        </section>
      </main>
      <ComposerDock>
        <footer className="playback-bar">
          <div className="run-actions">
            <Button
              className="ui-button primary solve-button"
              disabled={busy}
              onClick={() => solveNow()}
            >
              {t("求解", "Solve")}
            </Button>
            {busy && (
              <Button
                className="ui-button icon"
                onClick={cancel}
                aria-label={t("停止求解", "Stop search")}
              >
                <Square />
              </Button>
            )}
          </div>
          <div className="playback-controls">
            <Button
              className="ui-button icon ghost"
              disabled={!result || cursor === 0}
              onClick={() => seek(cursor - 1)}
              aria-label={t("上一步", "Previous step")}
            >
              <SkipBack />
            </Button>
            <Button
              className="ui-button icon"
              disabled={!result || last === 0}
              onClick={() => {
                if (cursor >= last) {
                  setCursor(0);
                  setSettledFrame(null);
                }
                setMotionPaused(playing);
                setPlaying(!playing);
              }}
              aria-label={
                playing
                  ? t("暂停播放", "Pause playback")
                  : t("播放过程", "Play process")
              }
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button
              className="ui-button icon ghost"
              disabled={!result || cursor >= last}
              onClick={() => seek(cursor + 1)}
              aria-label={t("下一步", "Next step")}
            >
              <SkipForward />
            </Button>
          </div>
          <div className="timeline">
            <input
              type="range"
              min={0}
              max={Math.max(1, last)}
              value={cursor}
              disabled={!result || !last}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label={t("回放位置", "Playback position")}
            />
            <span>
              {cursor} / {last}
            </span>
          </div>
          <Button
            className="ui-button ghost speed-button"
            aria-label={t("切换播放速度", "Change playback speed")}
            onClick={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
          >
            {speed}×
          </Button>
        </footer>
      </ComposerDock>
      <Dialog.Root open={dialog} onOpenChange={setDialog}>
        <Dialog.Portal>
          <Dialog.Backdrop className="ui-backdrop" />
          <Dialog.Popup className="ui-dialog editor-dialog">
            <div className="dialog-heading">
              <Dialog.Title>{t("编辑问题", "Edit problem")}</Dialog.Title>
              <Dialog.Close
                className="ui-button icon ghost"
                aria-label={t("关闭", "Close")}
              >
                <X />
              </Dialog.Close>
            </div>
            <Dialog.Description className="editor-description">
              {t(
                "start：初始事实 · finish：目标 · ops：操作符。事实使用完整字符串匹配，支持中文。",
                "start: initial facts · finish: goals · ops: operators. Facts use exact string matching, including Unicode.",
              )}
            </Dialog.Description>
            <label className="sr-only" htmlFor="problem-json">
              Problem JSON
            </label>
            <textarea
              id="problem-json"
              spellCheck={false}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-invalid={!!editError}
              aria-describedby={editError ? "editor-error" : undefined}
            />
            {editError && (
              <p className="editor-error" id="editor-error" role="alert">
                {editError}
              </p>
            )}
            <div className="editor-actions">
              <input
                type="file"
                accept=".json,application/json"
                ref={importInput}
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 100000)
                      throw new Error("JSON exceeds 100 KB.");
                    setDraft(await file.text());
                    setEditError("");
                  } catch (error) {
                    setEditError(String(error));
                  }
                  e.target.value = "";
                }}
              />
              <Button
                className="ui-button"
                onClick={() => importInput.current?.click()}
              >
                {t("导入 JSON", "Import JSON")}
              </Button>
              <Button className="ui-button primary" onClick={applyDraft}>
                {t("应用并求解", "Apply and solve")}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
