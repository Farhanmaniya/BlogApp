// const { header } = require("express-validator");

const API_BASE = "https://blogapp-production-6fe8.up.railway.app";

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token)  headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
        headers,
        ...options,
    });
    return res;
}

async function apiFetchForm(endpoint, formData) {
    const token = getToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers,
        body: formData,
    });
    return res;
}

function getCoverImageUrl(src) {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("//")) return `${window.location.protocol}${src}`;
    return `${API_BASE}${src}`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
    });
}

function isLoggedIn() {
    return localStorage.getItem("blogify_user") !== null;
}

function getUser() {
    const u = localStorage.getItem("blogify_user");
    return u ? JSON.parse(u) : null;
}

function isAdmin() {
    const u = getUser();
    return u?.role === "ADMIN";
}

async function logout() {
    try {
        await apiFetch("/user/logout", { method: "POST" });
    } catch (e) {}
    localStorage.removeItem("blogify_user");
    localStorage.removeItem("blogify_token");
    window.location.href = "login.html";
}

// Call this on every protected page at the top
function requireLogin(redirectPath = "login.html") {
    if (!isLoggedIn()) {
        window.location.href = redirectPath;
        return false;
    }
    return true;
}

function getToken() {
    return localStorage.getItem("blogify_token");
}

