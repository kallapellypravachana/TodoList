import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";

export default function FilterBar({ applied, onApply, onCreate }) {
  const [draft, setDraft] = useState(applied);
  useEffect(() => setDraft(applied), [applied]);
  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const dirty = draft.due !== "" || draft.status !== "all" || draft.priority !== "all";

  return (
    <div className="filterbar">
      <form className="filters" onSubmit={(e) => { e.preventDefault(); onApply(draft); }}>
        <label className="pill-field date">
          <Icon name="calendar" size={20} />
          <input type="date" aria-label="Due date" value={draft.due} onChange={set("due")} />
        </label>
        <label className="pill-field">
          <select aria-label="Status" value={draft.status} onChange={set("status")} className={draft.status === "all" ? "placeholder" : ""}>
            <option value="all">Choose Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <Icon name="down" size={18} />
        </label>
        <label className="pill-field">
          <select aria-label="Priority" value={draft.priority} onChange={set("priority")} className={draft.priority === "all" ? "placeholder" : ""}>
            <option value="all">Choose Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <Icon name="down" size={18} />
        </label>
        <button type="submit" className="btn lilac">Filter</button>
        {dirty && (
          <button type="button" className="link-btn"
                  onClick={() => onApply({ ...draft, due: "", status: "all", priority: "all" })}>
            Reset
          </button>
        )}
      </form>
      <button type="button" className="btn navy" onClick={onCreate}>
        <Icon name="plus" size={20} /> Create New Task
      </button>
    </div>
  );
}
