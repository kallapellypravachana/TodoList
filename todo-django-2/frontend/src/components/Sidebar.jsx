import Icon from "./Icon.jsx";

export default function Sidebar({ dark, onToggleDark, onHome }) {
  return (
    <nav className="sidebar" aria-label="Main">
      <div className="logo" aria-hidden="true">TM</div>
      <button className="side-btn" aria-label="All tasks" onClick={onHome}><Icon name="home" /></button>
      <button className="side-btn" aria-label="Reports" disabled><Icon name="chart" /></button>
      <button className="side-btn" aria-label="Analytics" disabled><Icon name="pie" /></button>
      <button className="side-btn" aria-label="Archive" disabled><Icon name="box" /></button>
      <button className="side-btn" aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} onClick={onToggleDark}>
        <Icon name={dark ? "sun" : "moon"} />
      </button>
      <button className="side-btn" aria-label="Settings" disabled><Icon name="settings" /></button>
    </nav>
  );
}
