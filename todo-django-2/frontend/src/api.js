const BASE = "/api/tasks/";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // DRF returns {field: ["message"]} for validation errors
    const fields = {};
    if (res.status === 400 && data && typeof data === "object") {
      for (const [k, v] of Object.entries(data)) fields[k] = Array.isArray(v) ? v[0] : String(v);
    }
    const err = new Error(data.detail || Object.values(fields)[0] || "Request failed");
    err.fields = fields;
    throw err;
  }
  return data;
}

export const listTasks = ({ status, priority, q, due }) => {
  const p = new URLSearchParams();
  if (status && status !== "all") p.set("status", status);
  if (priority && priority !== "all") p.set("priority", priority);
  if (q) p.set("q", q);
  if (due) p.set("due", due);
  return request(`${BASE}?${p}`);
};
export const getStats = () => request(`${BASE}stats/`);
export const createTask = (body) => request(BASE, { method: "POST", body });
export const updateTask = (id, body) => request(`${BASE}${id}/`, { method: "PUT", body });
export const patchTask = (id, body) => request(`${BASE}${id}/`, { method: "PATCH", body });
export const deleteTask = (id) => request(`${BASE}${id}/`, { method: "DELETE" });
