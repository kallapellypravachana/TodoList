import Icon from "./Icon.jsx";

const fmt = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const fmtTs = (ts) => fmt(ts.slice(0, 10));

export default function TaskTable({ tasks, onToggle, onEdit, onDelete, emptyText }) {
  return (
    <div className="table-wrap">
      <table className="tasks">
        <thead>
          <tr>
            <th>Title</th><th>Priority</th><th>Status</th>
            <th>Date Assigned</th><th>Due Date</th><th><span className="sr">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => {
            const done = t.status === "Completed";
            return (
              <tr key={t.id} className={done ? "done" : ""}>
                <td data-label="Title" className="title-cell">
                  <span className="title">{t.title}</span>
                  {t.description && <span className="desc">{t.description}</span>}
                </td>
                <td data-label="Priority"><span className={`pill pr-${t.priority}`}>{t.priority}</span></td>
                <td data-label="Status"><span className={`pill st-${t.status}`}>{t.status}</span></td>
                <td data-label="Date Assigned">{fmtTs(t.created_at)}</td>
                <td data-label="Due Date">{fmt(t.deadline)}</td>
                <td className="actions-cell">
                  <button className="act blue" onClick={() => onToggle(t)} title={done ? "Mark pending" : "Mark completed"}
                          aria-label={done ? `Mark "${t.title}" as pending` : `Mark "${t.title}" as completed`}>
                    <Icon name={done ? "undo" : "check"} size={18} />
                  </button>
                  <button className="act purple" onClick={() => onEdit(t)} title="Edit" aria-label={`Edit "${t.title}"`}>
                    <Icon name="edit" size={18} />
                  </button>
                  <button className="act pink" onClick={() => onDelete(t)} title="Delete" aria-label={`Delete "${t.title}"`}>
                    <Icon name="trash" size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tasks.length === 0 && <div className="empty">{emptyText}</div>}
    </div>
  );
}
