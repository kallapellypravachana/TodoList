import { useEffect, useRef, useState } from "react";

export default function TaskForm({ task, onSave, onClose }) {
  const dialogRef = useRef();
  const titleRef = useRef();
  const [values, setValues] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    deadline: task?.deadline ?? "",
    priority: task?.priority ?? "Medium",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dialogRef.current.showModal();
    titleRef.current.focus();
  }, []);

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!values.title.trim()) {
      setErrors({ title: "Enter a title for the task." });
      titleRef.current.focus();
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSave({ ...values, deadline: values.deadline || null }, task?.id);
    } catch (err) {
      setErrors(Object.keys(err.fields || {}).length ? err.fields : { form: err.message });
      setSaving(false);
    }
  }

  const cls = (n) => (errors[n] ? "invalid" : undefined);

  return (
    <dialog ref={dialogRef} onClose={onClose} onClick={(e) => e.target === dialogRef.current && onClose()}>
      <form onSubmit={submit} noValidate>
        <h2>{task ? "Edit task" : "Create new task"}</h2>
        <label>Title
          <input ref={titleRef} className={cls("title")} value={values.title} maxLength={120}
                 autoComplete="off" onChange={set("title")} />
          <span className="err" role="alert">{errors.title}</span>
        </label>
        <label>Description
          <textarea className={cls("description")} rows={3} maxLength={2000}
                    value={values.description} onChange={set("description")} />
          <span className="err" role="alert">{errors.description}</span>
        </label>
        <div className="two">
          <label>Due date
            <input type="date" className={cls("deadline")} value={values.deadline} onChange={set("deadline")} />
            <span className="err" role="alert">{errors.deadline}</span>
          </label>
          <label>Priority
            <select className={cls("priority")} value={values.priority} onChange={set("priority")}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <span className="err" role="alert">{errors.priority}</span>
          </label>
        </div>
        {errors.form && <span className="err" role="alert">{errors.form}</span>}
        <div className="dlg-actions">
          <button type="button" className="btn ghost" onClick={() => dialogRef.current.close()}>Cancel</button>
          <button type="submit" className="btn navy" disabled={saving}>Save task</button>
        </div>
      </form>
    </dialog>
  );
}
