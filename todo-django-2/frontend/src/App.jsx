import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import FilterBar from "./components/FilterBar.jsx";
import TaskTable from "./components/TaskTable.jsx";
import Pagination from "./components/Pagination.jsx";
import TaskForm from "./components/TaskForm.jsx";

const TABS = [
  ["all", "All Tasks"],
  ["Pending", "Pending Tasks"],
  ["Completed", "Completed Tasks"],
];
const BLANK = { tab: "all", due: "", status: "all", priority: "all", q: "" };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [f, setF] = useState(BLANK);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [formTask, setFormTask] = useState(undefined); // undefined=closed, null=new, object=edit
  const [toast, setToast] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const timer = useRef();

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const notify = useCallback((message, bad = false) => {
    setToast({ message, bad });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const load = useCallback(async () => {
    // tab and the status dropdown both narrow by status; the tab wins unless it is "All"
    const status = f.tab === "Pending" || f.tab === "Completed" ? f.tab : f.status;
    try {
      const [list, s] = await Promise.all([
        api.listTasks({ status, priority: f.priority, q: f.q, due: f.due }),
        api.getStats(),
      ]);
      setTasks(list);
      setStats(s);
    } catch (e) {
      notify(e.fields?.due || "Could not load tasks. Check that the server is running.", true);
    }
  }, [f, notify]);

  useEffect(() => { load(); }, [load]);

  const change = (patch) => { setF((cur) => ({ ...cur, ...patch })); setPage(1); };

  async function toggle(t) {
    const status = t.status === "Completed" ? "Pending" : "Completed";
    try {
      await api.patchTask(t.id, { status });
      notify(status === "Completed" ? "Task completed" : "Task marked pending");
      load();
    } catch (e) { notify(e.message, true); }
  }

  async function remove(t) {
    if (!window.confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteTask(t.id);
      notify("Task deleted");
      load();
    } catch (e) { notify(e.message, true); }
  }

  async function save(values, id) {
    if (id) await api.updateTask(id, values);
    else await api.createTask(values);
    notify(id ? "Task updated" : "Task added");
    setFormTask(undefined);
    load();
  }

  const pages = Math.max(1, Math.ceil(tasks.length / perPage));
  const current = Math.min(page, pages);
  const visible = tasks.slice((current - 1) * perPage, current * perPage);
  const filtering = f.q || f.due || f.priority !== "all" || f.status !== "all" || f.tab !== "all";

  return (
    <div className="page">
      <div className="card">
        <Sidebar dark={dark} onToggleDark={() => setDark((d) => !d)} onHome={() => change(BLANK)} />
        <main className="main">
          <Header q={f.q} onSearch={(q) => change({ q })} pending={stats?.pending ?? 0}
                  onBell={() => change({ tab: "Pending" })} />
          <h1>My Tasks</h1>

          <div className="tabs" role="tablist">
            {TABS.map(([value, label]) => (
              <button key={value} role="tab" aria-selected={f.tab === value}
                      onClick={() => change({ tab: value })}>
                {label}{stats && value !== "all" ? <span className="count">{{ Pending: stats.pending, Completed: stats.completed }[value]}</span> : null}
              </button>
            ))}
          </div>

          <FilterBar applied={f} onApply={(d) => change({ due: d.due, status: d.status, priority: d.priority })}
                     onCreate={() => setFormTask(null)} />

          <TaskTable tasks={visible} onToggle={toggle} onEdit={setFormTask} onDelete={remove}
                     emptyText={filtering ? "No tasks match these filters." : "No tasks yet. Select Create New Task to add your first one."} />

          <Pagination total={tasks.length} page={current} perPage={perPage} onPage={setPage}
                      onPerPage={(n) => { setPerPage(n); setPage(1); }} />
        </main>
      </div>

      {formTask !== undefined && <TaskForm task={formTask} onSave={save} onClose={() => setFormTask(undefined)} />}
      <div className={`toast${toast ? " show" : ""}${toast?.bad ? " bad" : ""}`} role="status">{toast?.message}</div>
    </div>
  );
}
