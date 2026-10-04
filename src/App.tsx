import { lazy, Suspense, useEffect, useState } from "react";
import { HashRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Atom, BarChart3, BookOpenCheck, Calculator, ClipboardCheck, Database, FlaskConical, GraduationCap, Home, LineChart, Menu, Microscope, Moon, Sun, SunMoon, Target, TestTubes, Waves, X, Sigma, Dumbbell,
} from "lucide-react";
import { cx } from "./components/ui";
import { useProgress } from "./store/progress";

const HomePage = lazy(() => import("./pages/Home"));
const Trail = lazy(() => import("./pages/Trail"));
const TopicPage = lazy(() => import("./pages/TopicPage"));
const TitrationSim = lazy(() => import("./pages/sims/TitrationSim"));
const CurvesSim = lazy(() => import("./pages/sims/CurvesSim"));
const SpeciesSim = lazy(() => import("./pages/sims/SpeciesSim"));
const SpectroSim = lazy(() => import("./pages/sims/SpectroSim"));
const ChromaSim = lazy(() => import("./pages/sims/ChromaSim"));
const StatsSim = lazy(() => import("./pages/sims/StatsSim"));
const Calculators = lazy(() => import("./pages/Calculators"));
const DataLab = lazy(() => import("./pages/DataLab"));
const Practice = lazy(() => import("./pages/Practice"));
const Exams = lazy(() => import("./pages/Exams"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PeriodicTable = lazy(() => import("./pages/PeriodicTable"));
const MyData = lazy(() => import("./pages/MyData"));

const NAV: { group: string; items: { to: string; label: string; icon: typeof Home }[] }[] = [
  { group: "", items: [{ to: "/", label: "Início", icon: Home }, { to: "/trilha", label: "Trilha de estudo", icon: GraduationCap }] },
  {
    group: "Simuladores",
    items: [
      { to: "/simuladores/titulacao", label: "Titulação animada", icon: FlaskConical },
      { to: "/simuladores/curvas", label: "Curvas de titulação", icon: LineChart },
      { to: "/simuladores/especies", label: "Distribuição de espécies", icon: Waves },
      { to: "/simuladores/espectro", label: "Espectrofotômetro", icon: Microscope },
      { to: "/simuladores/cromatografia", label: "Cromatógrafo", icon: TestTubes },
      { to: "/simuladores/estatistica", label: "Estatística visual", icon: Target },
    ],
  },
  {
    group: "Ferramentas",
    items: [
      { to: "/calculadoras", label: "Calculadoras", icon: Calculator },
      { to: "/laboratorio", label: "Laboratório de dados", icon: Sigma },
      { to: "/tabela", label: "Tabela periódica", icon: Atom },
    ],
  },
  {
    group: "Prática",
    items: [
      { to: "/praticar", label: "Praticar questões", icon: Dumbbell },
      { to: "/provas", label: "Provas e simulados", icon: ClipboardCheck },
      { to: "/painel", label: "Painel de desempenho", icon: BarChart3 },
      { to: "/dados", label: "Meus dados", icon: Database },
    ],
  },
];

function useThemeEffect() {
  const theme = useProgress((s) => s.theme);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0f1413" : "#0e7c86");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}

/** Conta tempo de estudo enquanto a aba está visível. */
function useStudyTimer() {
  const tick = useProgress((s) => s.tick);
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") tick(30);
    }, 30000);
    return () => clearInterval(id);
  }, [tick]);
}

function ThemeButton() {
  const { theme, setTheme } = useProgress();
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : SunMoon;
  const label = theme === "light" ? "Tema claro" : theme === "dark" ? "Tema escuro" : "Tema do sistema";
  return (
    <button onClick={() => setTheme(next)} className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink" title="Alternar tema">
      <Icon className="size-4" /> {label}
    </button>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex h-full flex-col">
      <NavLink to="/" onClick={onNavigate} className="mb-4 flex items-center gap-2.5 px-2.5 pt-1">
        <img src="./icon.svg" alt="" className="size-9" />
        <div>
          <div className="text-[15px] font-bold leading-tight">QuimiAnalítica</div>
          <div className="text-xs text-muted">do básico ao avançado</div>
        </div>
      </NavLink>
      <div className="thin-scroll flex-1 space-y-4 overflow-y-auto pr-1">
        {NAV.map((g) => (
          <div key={g.group || "main"}>
            {g.group && <div className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.group}</div>}
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === "/" || it.to === "/calculadoras"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cx("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors", isActive ? "bg-brand-soft font-semibold text-brand" : "text-ink/80 hover:bg-surface-2 hover:text-ink")
                  }
                >
                  <it.icon className="size-4 shrink-0" />
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-line pt-3">
        <ThemeButton />
      </div>
    </nav>
  );
}

function Loading() {
  return (
    <div className="grid h-64 place-items-center text-muted">
      <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
        <FlaskConical className="size-8 text-brand" />
      </motion.div>
    </div>
  );
}

function AnimatedRoutes() {
  const loc = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);
  return (
    <AnimatePresence mode="wait">
      <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
        <Suspense fallback={<Loading />}>
          <Routes location={loc}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trilha" element={<Trail />} />
            <Route path="/topico/:id" element={<TopicPage />} />
            <Route path="/simuladores/titulacao" element={<TitrationSim />} />
            <Route path="/simuladores/curvas" element={<CurvesSim />} />
            <Route path="/simuladores/especies" element={<SpeciesSim />} />
            <Route path="/simuladores/espectro" element={<SpectroSim />} />
            <Route path="/simuladores/cromatografia" element={<ChromaSim />} />
            <Route path="/simuladores/estatistica" element={<StatsSim />} />
            <Route path="/calculadoras" element={<Calculators />} />
            <Route path="/calculadoras/:id" element={<Calculators />} />
            <Route path="/laboratorio" element={<DataLab />} />
            <Route path="/praticar" element={<Practice />} />
            <Route path="/provas" element={<Exams />} />
            <Route path="/provas/:examId" element={<Exams />} />
            <Route path="/painel" element={<Dashboard />} />
            <Route path="/tabela" element={<PeriodicTable />} />
            <Route path="/dados" element={<MyData />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  useThemeEffect();
  useStudyTimer();
  const [open, setOpen] = useState(false);
  return (
    <HashRouter>
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="no-print sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-line px-3 py-4 lg:block">
          <Sidebar />
        </aside>
        <div className="min-w-0 flex-1">
          <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-2.5 backdrop-blur lg:hidden">
            <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-surface-2" aria-label="Abrir menu">
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 font-bold">
              <BookOpenCheck className="size-5 text-brand" /> QuimiAnalítica
            </div>
            <span className="w-9" />
          </header>
          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-bg px-3 py-4 lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", bounce: 0, duration: 0.3 }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-lg p-1.5 hover:bg-surface-2" aria-label="Fechar menu">
                <X className="size-5" />
              </button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </HashRouter>
  );
}
