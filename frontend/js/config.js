// ─── Blogify API Config ───────────────────────────────────────────────────
// Change this ONE line when you deploy backend to Railway/Render
const API_BASE = "http://localhost:8000";

// Helper: make authenticated fetch calls (sends cookies automatically)
async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include", // sends cookie with every request
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
    });
    return res;
}