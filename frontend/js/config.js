// ─── Blogify API Config ───────────────────────────────────────────────────
// Change this ONE line when you deploy backend to Railway/Render
const API_BASE = "http://localhost:8000";

// Regular JSON fetch (with cookies)
async function apiFetch(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(options.headers || {})},
        ...options,
    });
    return res;
}


// For file uploads (multipart/form-data) - browser sets Content-Type automatically
async function apiFetchForm(endpoint, formData) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST', 
        credentials: 'include',
        body: formData,
    });
    return res;
}

function formDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-In", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function isLoggedIn() {
    return localStorage.getItem('blogify_user') !== null;
}

function getUser() {
    const u = localStorage.getItem("blogify_user");
    return u ? JSON.parse(u) : null;
}

function logout() {
    localStorage.removeItem("blogify_user");
    window.location.href = 'admin/login.html';
}