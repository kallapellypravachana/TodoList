import Icon from "./Icon.jsx";

export default function Pagination({ total, page, perPage, onPage, onPerPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from = total ? (page - 1) * perPage + 1 : 0;
  const to = Math.min(total, page * perPage);
  return (
    <div className="pagination">
      <span className="muted">Rows per page:</span>
      <label className="pill-field small">
        <select aria-label="Rows per page" value={perPage} onChange={(e) => onPerPage(Number(e.target.value))}>
          {[5, 10, 20, 50].map((n) => <option key={n}>{n}</option>)}
        </select>
        <Icon name="down" size={18} />
      </label>
      <span className="muted range">{from}-{to} of {total}</span>
      <button className="pg" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}><Icon name="left" /></button>
      <button className="pg" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}><Icon name="right" /></button>
    </div>
  );
}
