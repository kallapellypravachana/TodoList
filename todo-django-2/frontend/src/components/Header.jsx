import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";

export default function Header({ q, onSearch, pending, onBell }) {
  const [open, setOpen] = useState(!!q);
  const [text, setText] = useState(q);
  const ref = useRef();

  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  useEffect(() => { setText(q); }, [q]);
  // debounce
  useEffect(() => {
    const t = setTimeout(() => text.trim() !== q && onSearch(text.trim()), 250);
    return () => clearTimeout(t);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="topbar">
      {open && (
        <input ref={ref} type="search" className="top-search" placeholder="Search title or description"
               aria-label="Search tasks" value={text} onChange={(e) => setText(e.target.value)}
               onKeyDown={(e) => e.key === "Escape" && (setText(""), setOpen(false))} />
      )}
      <button className="round-btn" aria-label="Search" onClick={() => setOpen((o) => !o)}><Icon name="search" size={26} /></button>
      <button className="round-btn bell" aria-label={`${pending} pending tasks`} onClick={onBell}>
        <Icon name="bell" size={26} />
        {pending > 0 && <span className="badge">{pending}</span>}
      </button>
      <div className="avatar" aria-hidden="true">ME</div>
    </div>
  );
}
