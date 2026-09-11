import { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import Landing from "./Landing";
import { ThemeProvider } from "./components/Theme";
import "./styles.css";
import "./landing.css";
const App = lazy(() => import("./App"));
function Router() {
  const [lab, setLab] = useState(location.hash.startsWith("#/lab"));
  useEffect(() => {
    const navigate = () => {
      const next = location.hash.startsWith("#/lab");
      setLab(next);
      if (next || !location.hash || location.hash === "#") scrollTo(0, 0);
    };
    addEventListener("hashchange", navigate);
    return () => removeEventListener("hashchange", navigate);
  }, []);
  useEffect(() => {
    document.title = lab
      ? "GPS — 通用问题解决者实验"
      : "GPS — 通用问题解决者：历史与求解实验";
    if (!lab) document.documentElement.lang = "zh-CN";
  }, [lab]);
  return lab ? (
    <Suspense
      fallback={
        <div className="route-loading" role="status">
          正在载入求解器…
        </div>
      }
    >
      <App />
    </Suspense>
  ) : (
    <Landing />
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  </StrictMode>,
);
